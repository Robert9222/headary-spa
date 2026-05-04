import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LocalizedString, LocalizedAny } from '../models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({ breaks: true, gfm: true });
  }

  /** Pick a localized string with PL → EN → FI → first fallback. */
  pickString(value: LocalizedString, lang: string): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    const order = [lang, 'pl', 'en', 'fi'];
    for (const l of order) {
      const v = value[l];
      if (v && v.trim().length) return v;
    }
    for (const k of Object.keys(value)) {
      const v = value[k];
      if (v && v.trim && v.trim().length) return v;
    }
    return '';
  }

  /** Pick a localized arbitrary value (object/array) with same fallback chain. */
  pickAny<T = any>(value: LocalizedAny<T>, lang: string): T | null {
    if (value == null) return null;
    if (typeof value !== 'object' || Array.isArray(value)) return value as T;
    const maybeLangKeys = ['pl', 'en', 'fi'];
    const looksLocalized = Object.keys(value as any).some(k => maybeLangKeys.includes(k));
    if (!looksLocalized) return value as unknown as T;
    const order = [lang, 'pl', 'en', 'fi'];
    for (const l of order) {
      const v = (value as any)[l];
      if (v != null) return v as T;
    }
    for (const k of Object.keys(value as any)) {
      const v = (value as any)[k];
      if (v != null) return v as T;
    }
    return null;
  }

  /** Render markdown → sanitized SafeHtml. */
  md(input: string | null | undefined): SafeHtml {
    if (!input) return '';
    const html = marked.parse(input, { async: false }) as string;
    const clean = DOMPurify.sanitize(html);
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }

  /**
   * Resolve image URL.
   * - `data:` / `blob:` — bez zmian.
   * - URL absolutny (https?://...) — używamy w takiej formie, jaką dostaliśmy z API.
   *   Dotyczy to też plików wgranych w panelu admina, które są hostowane na
   *   produkcyjnym backendzie (`https://headaryspa.motivogroup.pl/storage/...`).
   * - `assets/images/X.jpg|png` — zdjęcia projektowe; mapujemy na
   *   `/storage/images/X.webp` (jedno źródło w backendzie, format WebP).
   *   Dla innych assetów (svg, ico, fonts) zostawiamy jak są.
   * - Ścieżki `/storage/.../X.jpg|png` — automatycznie podmieniamy rozszerzenie
   *   na `.webp`, bo backend od teraz zapisuje wszystkie uploady w WebP,
   *   a stara baza obrazów (`storage/app/public/images`) ma komplet `.webp`.
   * - Ścieżki względne — doklejamy bazę API.
   */
  resolveImage(url: string | null | undefined): string {
    if (!url) return '';
    if (/^(data:|blob:)/i.test(url)) return url;

    // assets/images/X.jpg|png  ->  /storage/images/X.webp (jedno źródło)
    const assetMatch = url.match(/^assets\/images\/(.+)\.(jpe?g|png)$/i);
    if (assetMatch) {
      url = `/storage/images/${assetMatch[1]}.webp`;
    } else if (/^assets\//i.test(url)) {
      // inne assety (svg, ikonki) zostawiamy jak są
      return url;
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const apiBase = this.getApiBase();
    return url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
  }

  private isLocalDev(): boolean {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }

  /** Bazowy URL API (bez końcowego /).
   *  W dev zwracamy pusty string — używamy względnych URL `/api/...` i
   *  `/storage/...`, które Angularowe dev-proxy przekierowuje na backend
   *  (patrz `frontend/proxy.conf.json`). Dzięki temu obrazy i requesty API
   *  nie wymagają twardego portu 8000 i działają tak samo przeciwko
   *  lokalnemu Laravelowi, jak i przeciwko produkcji ustawionej w proxy.
   */
  private getApiBase(): string {
    if (this.isLocalDev()) return '';
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://headaryspa.motivogroup.pl';
  }
}


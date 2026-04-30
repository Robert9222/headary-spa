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

  /** Resolve image URL — absolute or relative to API host. */
  resolveImage(url: string | null | undefined): string {
    if (!url) return '';
    if (/^(https?:|data:|blob:|assets\/)/i.test(url)) return url;
    // storage paths: "/storage/..." or "storage/..."
    const base = 'http://localhost:8000';
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }
}


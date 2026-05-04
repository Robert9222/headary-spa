import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ContentService } from '../../../services/content.service';

type LangKey = 'pl' | 'en' | 'fi';

interface TranslationRow {
  path: string;
  label: string;
  pl: string;
  en: string;
  fi: string;
  enStatus: 'pending' | 'ok' | 'error';
  fiStatus: 'pending' | 'ok' | 'error';
  enError?: string;
  fiError?: string;
}

interface TranslationModalState {
  section: EditableSection;
  rows: TranslationRow[];
  applying: boolean;
}

interface EditableSection {
  id?: number;
  page_key: string;
  section_key: string;
  type: string;
  order: number;
  is_active: boolean;
  image_url: string | null;
  // translatable -> keyed by lang
  title: { [k in LangKey]: string };
  subtitle: { [k in LangKey]: string };
  body: { [k in LangKey]: string };
  // content is localized JSON (different shape per type)
  content: { [k in LangKey]: any };
  meta: { [key: string]: any };
  // UI state
  _dirty?: boolean;
  _saving?: boolean;
  _expanded?: boolean;
  _uploading?: boolean;
  _activeLang?: LangKey;

  _translating?: boolean;
  _translateProgress?: string;
}

const LANGS: LangKey[] = ['pl', 'en', 'fi'];const TYPES: { key: string; label: string }[] = [
  { key: 'hero', label: 'Hero (nagłówek z tłem)' },
  { key: 'rich-text', label: 'Tekst (markdown)' },
  { key: 'image-text', label: 'Obraz + tekst (np. „o mnie")' },
  { key: 'steps', label: 'Kroki (ikona + tytuł + opis)' },
  { key: 'two-column-lists', label: 'Dwie kolumny z listami' },
  { key: 'list', label: 'Lista (check / prep)' },
  { key: 'warning-list', label: 'Lista ostrzeżeń (z zagnieżdżeniem)' },
  { key: 'cta', label: 'CTA (wezwanie do działania)' },
];

@Component({
  selector: 'app-page-sections-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="editor">
      <div class="toolbar">
        <a routerLink="/admin/pages" class="back">← Strony</a>
        <h1>Sekcje strony: <code>{{ pageKey }}</code></h1>
        <div class="spacer"></div>
        <a [href]="publicPath" target="_blank" class="btn ghost">Podgląd ↗</a>
      </div>

      <div class="banner toast" *ngIf="message" [class.error]="isError" [class.success]="!isError">
        <span class="toast-icon">{{ isError ? '⚠' : '✓' }}</span>
        <span class="toast-text">{{ message }}</span>
        <button class="close" (click)="message = ''" aria-label="Zamknij">×</button>
      </div>

      <div class="add-bar">
        <strong>Dodaj sekcję:</strong>
        <select [(ngModel)]="newType">
          <option *ngFor="let t of types" [value]="t.key">{{ t.label }}</option>
        </select>
        <input [(ngModel)]="newKey" placeholder="klucz sekcji (np. faq)" />
        <button class="btn primary" (click)="addSection()" [disabled]="!newKey">+ Dodaj</button>
      </div>

      <div *ngIf="loading" class="empty">Ładowanie…</div>
      <div *ngIf="!loading && sections.length === 0" class="empty">Brak sekcji.</div>

      <div class="section-card" *ngFor="let s of sections; let i = index">
        <header class="card-head" (click)="s._expanded = !s._expanded">
          <div class="head-left">
            <span class="order-badge">#{{ s.order }}</span>
            <span class="type-badge">{{ s.type }}</span>
            <strong class="section-title">{{ s.title.pl || s.title.en || s.section_key }}</strong>
            <span class="key-badge">{{ s.section_key }}</span>
            <span class="inactive-badge" *ngIf="!s.is_active">nieaktywna</span>
            <span class="dirty-badge" *ngIf="s._dirty">● niezapisane</span>
          </div>
          <div class="head-right">
            <button type="button" class="icon-btn" (click)="moveUp(i); $event.stopPropagation()" [disabled]="i === 0" title="W górę">↑</button>
            <button type="button" class="icon-btn" (click)="moveDown(i); $event.stopPropagation()" [disabled]="i === sections.length - 1" title="W dół">↓</button>
            <button type="button" class="icon-btn danger" (click)="deleteSection(s); $event.stopPropagation()" title="Usuń">✕</button>
            <span class="chevron">{{ s._expanded ? '▼' : '▶' }}</span>
          </div>
        </header>

        <div class="card-body" *ngIf="s._expanded">

          <!-- Meta row: type, is_active -->
          <div class="row">
            <label>
              <span>Typ:</span>
              <select [(ngModel)]="s.type" (change)="markDirty(s)">
                <option *ngFor="let t of types" [value]="t.key">{{ t.label }}</option>
              </select>
            </label>
            <label class="checkbox">
              <input type="checkbox" [(ngModel)]="s.is_active" (change)="markDirty(s)" />
              <span>Aktywna (widoczna publicznie)</span>
            </label>
          </div>

          <!-- Image upload (hero, or any section that may use one) -->
          <div class="row image-row" *ngIf="s.type === 'hero' || s.type === 'image-text'">
            <div class="image-preview" *ngIf="s.image_url">
              <img [src]="content.resolveImage(s.image_url)" alt="preview">
            </div>
            <div class="image-actions">
              <label class="btn ghost file-btn">
                {{ s._uploading ? 'Wysyłanie…' : 'Wgraj zdjęcie' }}
                <input type="file" accept="image/*" (change)="onFileSelected($event, s)" [disabled]="!!s._uploading" hidden />
              </label>
              <input class="image-url-input" [(ngModel)]="s.image_url" (input)="markDirty(s)"
                     placeholder="lub wklej URL / ścieżkę (np. assets/images/foo.jpg)" />
            </div>
          </div>

          <!-- Language tabs -->
          <div class="lang-tabs">
            <button type="button" *ngFor="let l of langs"
                    class="lang-tab" [class.active]="(s._activeLang || 'pl') === l"
                    (click)="s._activeLang = l">
              {{ l.toUpperCase() }}
              <span *ngIf="hasLangContent(s, l)" class="lang-dot">●</span>
            </button>
            <span class="hint">
              Wpisz treść w zakładce <strong>PL</strong> — po kliknięciu „Zapisz" wersje EN i FI zostaną przetłumaczone automatycznie.
              Markdown działa (<code>**pogrubienie**</code>, <code>*kursywa*</code>, listy, nowa linia = akapit).
            </span>
          </div>

          <ng-container *ngFor="let l of langs">
            <div class="lang-pane" *ngIf="(s._activeLang || 'pl') === l">

              <div class="row">
                <label class="full">
                  <span>Tytuł ({{ l.toUpperCase() }})</span>
                  <input [(ngModel)]="s.title[l]" (input)="markDirty(s)" />
                </label>
              </div>

              <div class="row" *ngIf="s.type === 'hero' || s.type === 'list'">
                <label class="full">
                  <span>Podtytuł / eyebrow ({{ l.toUpperCase() }})</span>
                  <input [(ngModel)]="s.subtitle[l]" (input)="markDirty(s)" />
                </label>
              </div>

              <div class="row" *ngIf="s.type !== 'warning-list'">
                <label class="full">
                  <span>{{ bodyLabel(s.type) }} ({{ l.toUpperCase() }})</span>
                  <textarea rows="5" [(ngModel)]="s.body[l]" (input)="markDirty(s)"></textarea>
                </label>
              </div>

              <!-- Content per type -->
              <ng-container [ngSwitch]="s.type">

                <!-- two-column-lists -->
                <div *ngSwitchCase="'two-column-lists'" class="sub-card">
                  <h4>Kolumny ({{ l.toUpperCase() }})</h4>
                  <div class="row two-cols">
                    <label class="full">
                      <span>Lewa – nagłówek</span>
                      <input [ngModel]="getCF(s, l, 'leftHeading')"
                             (ngModelChange)="setCF(s, l, 'leftHeading', $event)" />
                    </label>
                    <label class="full">
                      <span>Prawa – nagłówek</span>
                      <input [ngModel]="getCF(s, l, 'rightHeading')"
                             (ngModelChange)="setCF(s, l, 'rightHeading', $event)" />
                    </label>
                  </div>
                  <div class="row two-cols">
                    <label class="full">
                      <span>Lewa – punkty (jedna linia = jeden punkt)</span>
                      <textarea rows="6"
                                [ngModel]="linesToText(getCF(s, l, 'leftItems'))"
                                (ngModelChange)="setCF(s, l, 'leftItems', textToLines($event))"></textarea>
                    </label>
                    <label class="full">
                      <span>Prawa – punkty</span>
                      <textarea rows="6"
                                [ngModel]="linesToText(getCF(s, l, 'rightItems'))"
                                (ngModelChange)="setCF(s, l, 'rightItems', textToLines($event))"></textarea>
                    </label>
                  </div>
                  <label class="full">
                    <span>Notka pod kolumnami (markdown)</span>
                    <textarea rows="3"
                              [ngModel]="getCF(s, l, 'note')"
                              (ngModelChange)="setCF(s, l, 'note', $event)"></textarea>
                  </label>
                  <div class="meta-row">
                    <label class="checkbox">
                      <input type="checkbox" [(ngModel)]="s.meta['right_highlight']" (change)="markDirty(s)" />
                      <span>Wyróżnij prawą kolumnę</span>
                    </label>
                  </div>
                </div>

                <!-- list -->
                <div *ngSwitchCase="'list'" class="sub-card">
                  <h4>Lista ({{ l.toUpperCase() }})</h4>
                  <label class="full">
                    <span>Punkty (jedna linia = jeden punkt)</span>
                    <textarea rows="7"
                              [ngModel]="linesToText(getCF(s, l, 'items'))"
                              (ngModelChange)="setCF(s, l, 'items', textToLines($event))"></textarea>
                  </label>
                  <label class="full">
                    <span>Stopka / tekst pod listą (markdown)</span>
                    <textarea rows="2"
                              [ngModel]="getCF(s, l, 'footer')"
                              (ngModelChange)="setCF(s, l, 'footer', $event)"></textarea>
                  </label>
                  <label class="full">
                    <span>Wskazówka (zielony boks, markdown)</span>
                    <textarea rows="2"
                              [ngModel]="getCF(s, l, 'tip')"
                              (ngModelChange)="setCF(s, l, 'tip', $event)"></textarea>
                  </label>
                  <div class="meta-row">
                    <label>
                      <span>Wariant listy:</span>
                      <select [(ngModel)]="s.meta['variant']" (change)="markDirty(s)">
                        <option value="check">check (✓)</option>
                        <option value="prep">prep (•)</option>
                      </select>
                    </label>
                  </div>
                </div>

                <!-- warning-list -->
                <div *ngSwitchCase="'warning-list'" class="sub-card">
                  <h4>Lista ostrzeżeń ({{ l.toUpperCase() }})</h4>
                  <p class="hint">
                    Dodawaj punkty przyciskiem „<strong>+ Punkt</strong>". Pod każdym punktem możesz dopisać podpunkty
                    przyciskiem „<strong>+ Podpunkt</strong>" (np. listę zabiegów z czasem oczekiwania).
                  </p>

                  <div class="warn-list">
                    <div class="warn-item" *ngFor="let it of getWarningItems(s, l); let i = index">
                      <div class="warn-row">
                        <span class="warn-bullet" title="Punkt nadrzędny">⚠</span>
                        <input class="warn-text"
                               [ngModel]="it.text"
                               (ngModelChange)="updateWarningItemText(s, l, i, $event)"
                               placeholder="Treść punktu (np. „ostre stany zapalne")" />
                        <button type="button" class="icon-btn" (click)="moveWarningItem(s, l, i, -1)"
                                [disabled]="i === 0" title="W górę">↑</button>
                        <button type="button" class="icon-btn" (click)="moveWarningItem(s, l, i, 1)"
                                [disabled]="i === getWarningItems(s, l).length - 1" title="W dół">↓</button>
                        <button type="button" class="icon-btn danger" (click)="removeWarningItem(s, l, i)" title="Usuń punkt">✕</button>
                      </div>

                      <div class="warn-children">
                        <div class="warn-child-row" *ngFor="let ch of (it.children || []); let j = index">
                          <span class="warn-sub-bullet">↳</span>
                          <input class="warn-text"
                                 [ngModel]="ch"
                                 (ngModelChange)="updateWarningChild(s, l, i, j, $event)"
                                 placeholder="Podpunkt (np. „kwas hialuronowy (ok. 3 miesiące)")" />
                          <button type="button" class="icon-btn danger" (click)="removeWarningChild(s, l, i, j)" title="Usuń podpunkt">✕</button>
                        </div>
                        <button type="button" class="btn ghost xs" (click)="addWarningChild(s, l, i)">+ Podpunkt</button>
                      </div>
                    </div>
                  </div>

                  <button type="button" class="btn ghost sm" (click)="addWarningItem(s, l)" style="margin-top: 0.6rem;">+ Punkt</button>

                  <label class="full" style="margin-top: 1rem;">
                    <span>Stopka (markdown)</span>
                    <textarea rows="2"
                              [ngModel]="getCF(s, l, 'footer')"
                              (ngModelChange)="setCF(s, l, 'footer', $event)"></textarea>
                  </label>
                </div>

                <!-- hero meta (per lang label) -->
                <div *ngSwitchCase="'hero'" class="sub-card">
                  <h4>CTA ({{ l.toUpperCase() }})</h4>
                  <div class="row two-cols">
                    <label class="full">
                      <span>Etykieta przycisku</span>
                      <input [ngModel]="s.meta['cta_label_' + l] || ''"
                             (ngModelChange)="setMeta(s, 'cta_label_' + l, $event)" />
                    </label>
                    <label class="full" *ngIf="l === 'pl'">
                      <span>URL (wspólny dla wszystkich języków)</span>
                      <input [ngModel]="s.meta['cta_url'] || ''"
                             (ngModelChange)="setMeta(s, 'cta_url', $event)" />
                    </label>
                  </div>
                </div>

                <!-- cta -->
                <div *ngSwitchCase="'cta'" class="sub-card">
                  <h4>Przyciski CTA ({{ l.toUpperCase() }})</h4>
                  <div class="row two-cols">
                    <label class="full">
                      <span>Etykieta – przycisk główny</span>
                      <input [ngModel]="s.meta['primary_label_' + l] || ''"
                             (ngModelChange)="setMeta(s, 'primary_label_' + l, $event)" />
                    </label>
                    <label class="full">
                      <span>Etykieta – przycisk drugorzędny</span>
                      <input [ngModel]="s.meta['secondary_label_' + l] || ''"
                             (ngModelChange)="setMeta(s, 'secondary_label_' + l, $event)" />
                    </label>
                  </div>
                  <div class="row two-cols" *ngIf="l === 'pl'">
                    <label class="full">
                      <span>URL – główny</span>
                      <input [ngModel]="s.meta['primary_url'] || ''"
                             (ngModelChange)="setMeta(s, 'primary_url', $event)" />
                    </label>
                    <label class="full">
                      <span>URL – drugorzędny (np. /services)</span>
                      <input [ngModel]="s.meta['secondary_url'] || ''"
                             (ngModelChange)="setMeta(s, 'secondary_url', $event)" />
                    </label>
                  </div>
                </div>

                <!-- steps -->
                <div *ngSwitchCase="'steps'" class="sub-card">
                  <h4>Kroki ({{ l.toUpperCase() }})</h4>
                  <p class="hint">Każdy krok to ikona/emoji + krótki tytuł + opis. Dodawaj wiersze przyciskiem poniżej.</p>
                  <div class="steps-list">
                    <div class="step-row" *ngFor="let st of getStepsArray(s, l); let i = index">
                      <input class="step-icon" [ngModel]="st.icon"
                             (ngModelChange)="updateStep(s, l, i, 'icon', $event)" placeholder="📅" />
                      <input class="step-title" [ngModel]="st.title"
                             (ngModelChange)="updateStep(s, l, i, 'title', $event)" placeholder="Tytuł kroku" />
                      <input class="step-desc" [ngModel]="st.desc"
                             (ngModelChange)="updateStep(s, l, i, 'desc', $event)" placeholder="Krótki opis" />
                      <button type="button" class="icon-btn danger" (click)="removeStep(s, l, i)" title="Usuń">✕</button>
                    </div>
                  </div>
                  <button type="button" class="btn ghost sm" (click)="addStep(s, l)" style="margin-top: 0.5rem;">+ Dodaj krok</button>
                </div>

                <!-- image-text (just uses image_url + body — no extra fields needed) -->
                <div *ngSwitchCase="'image-text'" class="sub-card">
                  <h4>Obraz + tekst</h4>
                  <p class="hint">Ten typ używa pola „Treść" (markdown) powyżej oraz zdjęcia z górnej sekcji.
                    Tekst wyrenderuje się obok obrazka na froncie.</p>
                </div>

              </ng-container>

            </div>
          </ng-container>

          <div class="card-actions">
            <button class="btn primary" (click)="save(s)" [disabled]="s._saving || s._translating || !s._dirty">
              {{ s._translating ? ('Tłumaczenie… ' + (s._translateProgress || '')) : (s._saving ? 'Zapisywanie…' : 'Zapisz (PL → EN/FI auto)') }}
            </button>
            <button class="btn ghost" (click)="reload()" [disabled]="s._saving || s._translating">Odśwież</button>
          </div>
        </div>
      </div>

      <!-- TRANSLATION PREVIEW MODAL -->
      <div class="tmodal-backdrop" *ngIf="translationModal" (click)="closeTranslationModal()">
        <div class="tmodal" (click)="$event.stopPropagation()">
          <div class="tmodal-head">
            <div>
              <h2>🌐 Podgląd tłumaczeń PL → EN / FI</h2>
              <p>Sprawdź i edytuj każde tłumaczenie przed zatwierdzeniem. Używa darmowego API MyMemory.</p>
            </div>
            <button class="close" (click)="closeTranslationModal()" [disabled]="translationModal.applying">×</button>
          </div>
          <div class="tmodal-body">
            <div class="trow" *ngFor="let row of translationModal.rows">
              <div class="trow-label">{{ row.label }}</div>
              <div class="trow-grid">
                <div class="tcol">
                  <div class="tcol-head">🇵🇱 PL (oryginał)</div>
                  <div class="tcol-pl">{{ row.pl }}</div>
                </div>
                <div class="tcol" [class.status-error]="row.enStatus === 'error'">
                  <div class="tcol-head">
                    🇬🇧 EN
                    <span class="status pending" *ngIf="row.enStatus === 'pending'">⏳ tłumaczenie…</span>
                    <span class="status ok" *ngIf="row.enStatus === 'ok'">✓</span>
                    <span class="status err" *ngIf="row.enStatus === 'error'" [title]="row.enError || ''">✕ błąd</span>
                  </div>
                  <textarea [(ngModel)]="row.en" rows="2" [disabled]="row.enStatus === 'pending'"></textarea>
                </div>
                <div class="tcol" [class.status-error]="row.fiStatus === 'error'">
                  <div class="tcol-head">
                    🇫🇮 FI
                    <span class="status pending" *ngIf="row.fiStatus === 'pending'">⏳ tłumaczenie…</span>
                    <span class="status ok" *ngIf="row.fiStatus === 'ok'">✓</span>
                    <span class="status err" *ngIf="row.fiStatus === 'error'" [title]="row.fiError || ''">✕ błąd</span>
                  </div>
                  <textarea [(ngModel)]="row.fi" rows="2" [disabled]="row.fiStatus === 'pending'"></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="tmodal-foot">
            <div class="tmodal-summary">
              {{ translationDoneCount() }}/{{ translationModal.rows.length * 2 }} tłumaczeń gotowe
            </div>
            <button class="btn ghost" (click)="closeTranslationModal()" [disabled]="translationModal.applying">Anuluj</button>
            <button class="btn primary" (click)="applyTranslations()"
                    [disabled]="!translationAllDone() || translationModal.applying">
              ✓ Zastosuj tłumaczenia
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 1.5rem 2.2rem 2.5rem; }
    .editor { max-width: 1100px; margin: 0 auto; }
    .toolbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .toolbar h1 { margin: 0; font-size: 1.5rem; color: var(--primary-color, #2d2a26); font-family: var(--font-secondary, serif); }
    .toolbar h1 code { font-size: 1.2rem; background: #eee; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .back { color: #666; text-decoration: none; }
    .spacer { flex: 1; }
    .banner { background: #e8f5e8; padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1rem; display: flex; justify-content: space-between; }
    .banner.error { background: #fde4e4; color: #8c3a3a; }
    .banner .close { background: transparent; border: 0; font-size: 1.2rem; cursor: pointer; }

    /* Toast-style success/error notification (fixed top-right) */
    .banner.toast {
      position: fixed;
      top: 1.2rem;
      right: 1.5rem;
      z-index: 2000;
      min-width: 300px;
      max-width: 460px;
      padding: 0.95rem 1.2rem;
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .banner.toast.success {
      background: linear-gradient(135deg, #2e7d57, #3a9168);
      color: #fff;
    }
    .banner.toast.error {
      background: linear-gradient(135deg, #c0392b, #d05044);
      color: #fff;
    }
    .banner.toast .toast-icon {
      width: 28px; height: 28px; flex-shrink: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: grid; place-items: center;
      font-weight: 700; font-size: 1rem;
    }
    .banner.toast .toast-text { flex: 1; font-size: 0.95rem; line-height: 1.4; }
    .banner.toast .close {
      color: #fff; opacity: 0.85;
      width: 26px; height: 26px;
      border-radius: 50%;
      transition: background 0.15s, opacity 0.15s;
    }
    .banner.toast .close:hover { background: rgba(255,255,255,0.18); opacity: 1; }

    @keyframes toastIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .add-bar { background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
    .add-bar select, .add-bar input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .add-bar input { flex: 1; min-width: 200px; }

    .empty { background: #fff; padding: 3rem; text-align: center; color: #888; border-radius: 8px; }

    .section-card { background: #fff; border-radius: 8px; margin-bottom: 0.8rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
    .card-head { display: flex; align-items: center; gap: 0.6rem; padding: 0.9rem 1rem; cursor: pointer; user-select: none; }
    .card-head:hover { background: #fafafa; }
    .head-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; flex-wrap: wrap; }
    .head-right { display: flex; align-items: center; gap: 0.3rem; }
    .order-badge { background: #eee; color: #555; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
    .type-badge { background: var(--accent-color, #E8DCC8); color: #5a4a1f; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .key-badge { color: #888; font-size: 0.8rem; font-family: monospace; }
    .inactive-badge { background: #fde4e4; color: #8c3a3a; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .dirty-badge { color: #c17b7b; font-size: 0.8rem; }
    .section-title { color: #333; }
    .chevron { color: #888; margin-left: 0.5rem; font-size: 0.8rem; }
    .icon-btn { background: transparent; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; }
    .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .icon-btn.danger:hover { background: #fde4e4; border-color: #c17b7b; color: #8c3a3a; }

    .card-body { padding: 1rem 1.2rem 1.5rem; border-top: 1px solid #eee; background: #fafafa; }
    .row { display: flex; gap: 1rem; margin-bottom: 0.8rem; flex-wrap: wrap; align-items: start; }
    .row label { display: flex; flex-direction: column; gap: 0.3rem; }
    .row label.full { flex: 1; min-width: 260px; }
    .row label span { font-size: 0.85rem; color: #555; font-weight: 600; }
    .row input, .row textarea, .row select { padding: 0.55rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
    .row textarea { font-family: 'Consolas', monospace; font-size: 0.9rem; resize: vertical; }
    .row label.checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
    .row label.checkbox input { width: auto; }
    .row label.checkbox span { font-weight: 400; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .two-cols label { flex: initial; }

    .image-row { background: #fff; padding: 0.8rem; border-radius: 6px; border: 1px dashed #ccc; align-items: center; }
    .image-preview { width: 140px; height: 90px; overflow: hidden; border-radius: 4px; flex-shrink: 0; }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; }
    .image-actions { flex: 1; display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
    .image-url-input { flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }

    .lang-tabs { display: flex; gap: 0.3rem; margin: 1rem 0 0.5rem; border-bottom: 1px solid #ddd; align-items: center; }
    .lang-tab { background: transparent; border: 0; padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; color: #888; border-bottom: 3px solid transparent; }
    .lang-tab.active { color: var(--primary-color, #2d2a26); border-bottom-color: var(--secondary-color, #C9A96E); }
    .lang-tabs .hint { margin-left: auto; font-size: 0.8rem; color: #888; font-weight: 400; }
    .lang-tabs .hint code, .hint code { background: #eee; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
    .lang-dot { color: #2e7d57; margin-left: 0.3rem; font-size: 0.7rem; }
    .copy-lang-btn {
      background: transparent; border: 1px solid #C9A96E; color: #8a6a2f;
      padding: 0.35rem 0.7rem; border-radius: 6px; cursor: pointer;
      font-size: 0.78rem; font-weight: 600; margin-left: 0.5rem;
      transition: all 0.15s;
    }
    .copy-lang-btn:hover { background: #C9A96E; color: #fff; }
    .translate-btn {
      background: #2e7d57; border: 1px solid #2e7d57; color: #fff;
      padding: 0.35rem 0.7rem; border-radius: 6px; cursor: pointer;
      font-size: 0.78rem; font-weight: 600; margin-left: 0.3rem;
      transition: all 0.15s;
    }
    .translate-btn:hover:not(:disabled) { background: #245e42; }
    .translate-btn:disabled { opacity: 0.6; cursor: progress; }
    .lang-pane { padding-top: 0.6rem; }

    .sub-card { background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e8e8e8; margin-top: 0.8rem; }
    .sub-card h4 { margin: 0 0 0.8rem; color: var(--primary-color, #2d2a26); font-size: 0.95rem; }
    .meta-row { margin-top: 0.5rem; }
    .hint { color: #888; font-size: 0.8rem; line-height: 1.5; margin: 0 0 0.8rem; }

    /* steps editor */
    .steps-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .step-row { display: grid; grid-template-columns: 60px 1fr 2fr auto; gap: 0.5rem; align-items: center; }
    .step-row input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
    .step-row .step-icon { text-align: center; font-size: 1.05rem; }
    @media (max-width: 700px) { .step-row { grid-template-columns: 60px 1fr auto; } .step-row .step-desc { grid-column: 1 / -1; } }

    /* ---------- warning-list editor ---------- */
    .warn-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .warn-item {
      background: #fdfbf6;
      border: 1px solid #ebe6dd;
      border-radius: 8px;
      padding: 0.6rem 0.7rem;
    }
    .warn-row { display: grid; grid-template-columns: 28px 1fr auto auto auto; gap: 0.4rem; align-items: center; }
    .warn-bullet { font-size: 1rem; color: #c9a96e; text-align: center; }
    .warn-text {
      padding: 0.5rem 0.6rem;
      border: 1px solid #d8d3c9;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      background: #fff;
    }
    .warn-text:focus { outline: none; border-color: #c9a96e; box-shadow: 0 0 0 3px rgba(201,169,110,0.15); }
    .warn-children {
      margin-top: 0.5rem;
      padding-left: 1.6rem;
      border-left: 2px dashed #e2dccf;
      display: flex; flex-direction: column; gap: 0.35rem;
    }
    .warn-child-row { display: grid; grid-template-columns: 24px 1fr auto; gap: 0.4rem; align-items: center; }
    .warn-sub-bullet { color: #b3a98e; text-align: center; font-size: 0.95rem; }
    .btn.xs { padding: 0.3rem 0.6rem; font-size: 0.8rem; align-self: flex-start; }
    @media (max-width: 700px) {
      .warn-row { grid-template-columns: 24px 1fr auto; }
      .warn-row .icon-btn:nth-of-type(1),
      .warn-row .icon-btn:nth-of-type(2) { display: none; }
    }

    .card-actions { display: flex; gap: 0.6rem; margin-top: 1rem; }
    .btn { padding: 0.6rem 1.2rem; border-radius: 4px; border: 0; cursor: pointer; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn.primary { background: var(--secondary-color, #C9A96E); color: #fff; }
    .btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn.ghost { background: transparent; color: #555; border: 1px solid #ccc; }
    .file-btn { cursor: pointer; }

    /* ---------- Translation modal ---------- */
    .tmodal-backdrop {
      position: fixed; inset: 0;
      background: rgba(45, 42, 38, 0.55);
      backdrop-filter: blur(3px);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 3rem 1rem; z-index: 1000;
      animation: fade 0.15s ease;
    }
    .tmodal {
      background: #fff; border-radius: 14px;
      width: 100%; max-width: 1100px;
      max-height: calc(100vh - 6rem);
      display: flex; flex-direction: column;
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      animation: slide 0.2s ease;
    }
    .tmodal-head {
      padding: 1.1rem 1.4rem;
      border-bottom: 1px solid #ebe6dd;
      display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
      background: linear-gradient(180deg, #faf7f2, #fff);
    }
    .tmodal-head h2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; color: #2d2a26; }
    .tmodal-head p { margin: 0.3rem 0 0; color: #8a817a; font-size: 0.85rem; }
    .tmodal-head .close {
      background: transparent; border: 0; font-size: 1.5rem; cursor: pointer;
      color: #8a817a; line-height: 1; padding: 0.2rem 0.6rem; border-radius: 6px;
    }
    .tmodal-head .close:hover:not(:disabled) { background: #f4f1ec; color: #2d2a26; }
    .tmodal-head .close:disabled { opacity: 0.3; cursor: not-allowed; }

    .tmodal-body { flex: 1; overflow-y: auto; padding: 1rem 1.4rem; }

    .trow { padding: 0.9rem 0; border-bottom: 1px solid #f0ece3; }
    .trow:last-child { border-bottom: 0; }
    .trow-label { font-size: 0.78rem; color: #8a817a; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; margin-bottom: 0.5rem; }
    .trow-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; }
    @media (max-width: 900px) { .trow-grid { grid-template-columns: 1fr; } }

    .tcol { display: flex; flex-direction: column; gap: 0.3rem; }
    .tcol-head { font-size: 0.78rem; font-weight: 600; color: #5a524a; display: flex; justify-content: space-between; align-items: center; }
    .tcol-pl {
      background: #faf7f2; border: 1px solid #ebe6dd; border-radius: 6px;
      padding: 0.5rem 0.7rem; font-size: 0.9rem; color: #2d2a26; min-height: 50px;
      white-space: pre-wrap; word-break: break-word;
    }
    .tcol textarea {
      padding: 0.5rem 0.7rem; border: 1px solid #d9d0c0; border-radius: 6px;
      font-size: 0.9rem; font-family: inherit; resize: vertical; min-height: 50px;
      width: 100%; box-sizing: border-box; color: #2d2a26; background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .tcol textarea:focus {
      outline: none; border-color: #C9A96E;
      box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
    }
    .tcol textarea:disabled { background: #faf7f2; color: #8a817a; cursor: wait; }
    .tcol.status-error textarea { border-color: #e8c5bf; background: #fdf5f5; }

    .tcol .status { font-weight: 600; font-size: 0.75rem; letter-spacing: 0.3px; }
    .tcol .status.pending { color: #8a817a; }
    .tcol .status.ok { color: #2e7d57; }
    .tcol .status.err { color: #c0392b; cursor: help; }

    .tmodal-foot {
      padding: 0.9rem 1.4rem;
      border-top: 1px solid #ebe6dd;
      display: flex; justify-content: flex-end; align-items: center; gap: 0.6rem;
      background: #faf7f2;
    }
    .tmodal-summary { margin-right: auto; font-size: 0.85rem; color: #8a817a; font-weight: 500; }

    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PageSectionsEditorComponent implements OnInit {
  pageKey = 'kobido';
  publicPath = '/kobido';
  sections: EditableSection[] = [];
  loading = true;
  message = '';
  isError = false;
  types = TYPES;
  langs = LANGS;
  newType: string = 'rich-text';
  newKey: string = '';
  translationModal: TranslationModalState | null = null;

  constructor(
    private api: ApiService,
    public content: ContentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      this.pageKey = pm.get('pageKey') || 'kobido';
      this.publicPath = this.pageKey === 'kobido' ? '/kobido' : `/${this.pageKey}`;
      this.reload();
    });
  }

  reload(): void {
    this.loading = true;
    this.api.adminGetPageSections(this.pageKey).subscribe({
      next: (data) => {
        this.sections = (data || [])
          .map((s: any) => this.normalize(s))
          .sort((a: EditableSection, b: EditableSection) => a.order - b.order);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Nie udało się pobrać sekcji. Czy jesteś zalogowana jako admin?');
        this.loading = false;
      },
    });
  }

  private normalize(raw: any): EditableSection {
    const tl = (v: any) => ({
      pl: (v && v.pl) || '',
      en: (v && v.en) || '',
      fi: (v && v.fi) || '',
    });
    const tlAny = (v: any) => ({
      pl: (v && v.pl) != null ? v.pl : {},
      en: (v && v.en) != null ? v.en : {},
      fi: (v && v.fi) != null ? v.fi : {},
    });
    return {
      id: raw.id,
      page_key: raw.page_key,
      section_key: raw.section_key,
      type: raw.type,
      order: raw.order ?? 0,
      is_active: !!raw.is_active,
      image_url: raw.image_url || null,
      title: tl(raw.title),
      subtitle: tl(raw.subtitle),
      body: tl(raw.body),
      content: tlAny(raw.content),
      meta: raw.meta || {},
      _expanded: false,
      _activeLang: 'pl',
    };
  }

  markDirty(s: EditableSection) { s._dirty = true; }


  /** True if section has any text in given language. */
  hasLangContent(s: EditableSection, l: LangKey): boolean {
    if ((s.title[l] || '').trim()) return true;
    if ((s.subtitle[l] || '').trim()) return true;
    if ((s.body[l] || '').trim()) return true;
    const c = s.content[l];
    if (c && typeof c === 'object' && Object.keys(c).length) return true;
    return false;
  }

  /**
   * Automatically translate all text fields from PL to EN and FI using the
   * backend translation proxy (MyMemory). Opens a preview modal where the
   * user can review and edit the translations before applying.
   */
  async autoTranslate(s: EditableSection): Promise<void> {
    if (s._translating) return;

    // Collect all strings that need translating (with location in the object)
    const fields: TranslationRow[] = [];

    const pushIfText = (path: string, label: string, v: any) => {
      if (typeof v === 'string' && v.trim().length > 0) {
        fields.push({ path, label, pl: v, en: '', fi: '', enStatus: 'pending', fiStatus: 'pending' });
      }
    };

    pushIfText('title', 'Tytuł', s.title.pl);
    pushIfText('subtitle', 'Podtytuł', s.subtitle.pl);
    pushIfText('body', 'Treść', s.body.pl);

    // Deep walk on content.pl
    const walkContent = (value: any, path: string, label: string) => {
      if (value == null) return;
      if (typeof value === 'string') { pushIfText(path, label, value); return; }
      if (Array.isArray(value)) {
        value.forEach((item, idx) => walkContent(item, `${path}[${idx}]`, `${label} [${idx + 1}]`));
        return;
      }
      if (typeof value === 'object') {
        Object.keys(value).forEach(k => walkContent(value[k], `${path}.${k}`, `${label} · ${k}`));
      }
    };
    walkContent(s.content.pl, 'content', 'Treść');

    // Meta labels per-lang
    const metaKeysPl = ['cta_label_pl', 'primary_label_pl', 'secondary_label_pl'];
    metaKeysPl.forEach(k => {
      if (typeof s.meta?.[k] === 'string' && s.meta[k].trim()) {
        fields.push({ path: `meta.${k}`, label: 'Etykieta CTA: ' + k.replace(/_pl$/, ''), pl: s.meta[k], en: '', fi: '', enStatus: 'pending', fiStatus: 'pending' });
      }
    });

    if (fields.length === 0) {
      this.showError('Brak treści w zakładce PL do przetłumaczenia.');
      return;
    }

    this.translationModal = { section: s, rows: fields, applying: false };
    s._translating = true;

    // Fire all translations (queue 2 requests at a time to be gentle on MyMemory)
    const queue: Array<() => Promise<void>> = [];
    for (const row of fields) {
      queue.push(async () => {
        try {
          const en = await this.translateOne(row.pl, 'pl', 'en');
          row.en = en;
          row.enStatus = 'ok';
        } catch (e: any) {
          row.en = row.pl;
          row.enStatus = 'error';
          row.enError = e?.error?.error || e?.message || 'błąd';
        }
      });
      queue.push(async () => {
        try {
          const fi = await this.translateOne(row.pl, 'pl', 'fi');
          row.fi = fi;
          row.fiStatus = 'ok';
        } catch (e: any) {
          row.fi = row.pl;
          row.fiStatus = 'error';
          row.fiError = e?.error?.error || e?.message || 'błąd';
        }
      });
    }

    // Run queue with concurrency = 2
    const concurrency = 2;
    let idx = 0;
    const runners = Array.from({ length: concurrency }, async () => {
      while (idx < queue.length) {
        const my = idx++;
        await queue[my]();
      }
    });
    await Promise.all(runners);

    s._translating = false;
  }

  /** Apply the translations from the modal into the section and close it. */
  applyTranslations(): void {
    if (!this.translationModal) return;
    const { section: s, rows } = this.translationModal;

    const newTitle = { ...s.title };
    const newSubtitle = { ...s.subtitle };
    const newBody = { ...s.body };
    const newContent: { [k in LangKey]: any } = {
      pl: s.content.pl,
      en: JSON.parse(JSON.stringify(s.content.pl || {})),
      fi: JSON.parse(JSON.stringify(s.content.pl || {})),
    };
    const newMeta = { ...(s.meta || {}) };

    for (const row of rows) {
      this.applyTranslation(row.path, row.en, 'en', { title: newTitle, subtitle: newSubtitle, body: newBody, content: newContent, meta: newMeta });
      this.applyTranslation(row.path, row.fi, 'fi', { title: newTitle, subtitle: newSubtitle, body: newBody, content: newContent, meta: newMeta });
    }

    s.title = newTitle;
    s.subtitle = newSubtitle;
    s.body = newBody;
    s.content = newContent;
    s.meta = newMeta;
    this.markDirty(s);
    this.translationModal = null;
    this.showOk(`Zastosowano ${rows.length} tłumaczeń. Kliknij „Zapisz", aby utrwalić w bazie.`);
  }

  closeTranslationModal(): void {
    if (this.translationModal?.applying) return;
    this.translationModal = null;
  }

  /** Count of finished translation cells (ok or error) for modal footer. */
  translationDoneCount(): number {
    if (!this.translationModal) return 0;
    let n = 0;
    for (const row of this.translationModal.rows) {
      if (row.enStatus !== 'pending') n++;
      if (row.fiStatus !== 'pending') n++;
    }
    return n;
  }

  translationAllDone(): boolean {
    if (!this.translationModal) return false;
    return this.translationModal.rows.every(r => r.enStatus !== 'pending' && r.fiStatus !== 'pending');
  }

  private translateOne(text: string, source: string, target: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.api.translate(text, source, target).subscribe({
        next: (res: any) => resolve(res?.translated || text),
        error: (e) => reject(e),
      });
    });
  }

  /**
   * Apply translated string back into the correct place.
   * path examples:
   *   'title'                   -> targetsBuckets.title[lang]
   *   'subtitle'                -> targetsBuckets.subtitle[lang]
   *   'body'                    -> targetsBuckets.body[lang]
   *   'content.leftHeading'     -> targetsBuckets.content[lang].leftHeading
   *   'content.items[2]'        -> targetsBuckets.content[lang].items[2]
   *   'content.items[0].text'   -> targetsBuckets.content[lang].items[0].text
   *   'meta.cta_label_pl'       -> targetsBuckets.meta['cta_label_en' | 'cta_label_fi']
   */
  private applyTranslation(
    path: string,
    translated: string,
    lang: LangKey,
    buckets: { title: any; subtitle: any; body: any; content: any; meta: any }
  ): void {
    if (path === 'title') { buckets.title[lang] = translated; return; }
    if (path === 'subtitle') { buckets.subtitle[lang] = translated; return; }
    if (path === 'body') { buckets.body[lang] = translated; return; }

    if (path.startsWith('meta.')) {
      const key = path.substring(5); // e.g. cta_label_pl
      const newKey = key.replace(/_pl$/, `_${lang}`);
      buckets.meta[newKey] = translated;
      return;
    }

    if (path.startsWith('content.') || path === 'content') {
      const rest = path.substring('content'.length); // e.g. '.items[0].text' or ''
      this.setByPath(buckets.content[lang], rest, translated);
    }
  }

  /** Set a value in an object using a path like '.items[0].text'. */
  private setByPath(root: any, path: string, value: any): void {
    if (!path) return;
    const tokens = this.tokenizePath(path);
    let cur = root;
    for (let i = 0; i < tokens.length - 1; i++) {
      const tk = tokens[i];
      if (cur[tk] === undefined || cur[tk] === null) {
        // create container based on next token type
        cur[tk] = typeof tokens[i + 1] === 'number' ? [] : {};
      }
      cur = cur[tk];
    }
    const last = tokens[tokens.length - 1];
    cur[last] = value;
  }

  /** '.items[0].text' -> ['items', 0, 'text'] */
  private tokenizePath(path: string): (string | number)[] {
    const out: (string | number)[] = [];
    const regex = /\.([a-zA-Z_][\w]*)|\[(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(path)) !== null) {
      if (m[1] !== undefined) out.push(m[1]);
      else if (m[2] !== undefined) out.push(parseInt(m[2], 10));
    }
    return out;
  }

  bodyLabel(type: string): string {
    if (type === 'hero') return 'Tagline';
    if (type === 'list') return 'Wprowadzenie (markdown)';
    if (type === 'rich-text') return 'Treść (markdown)';
    if (type === 'image-text') return 'Treść obok obrazka (markdown)';
    if (type === 'two-column-lists') return 'Wprowadzenie (markdown)';
    if (type === 'steps') return 'Wprowadzenie (markdown, opcjonalne)';
    if (type === 'cta') return 'Opis / zachęta';
    return 'Treść';
  }

  /* ---------- steps helpers (icon + title + desc per language) ---------- */
  getStepsArray(s: EditableSection, lang: LangKey): Array<{ icon: string; title: string; desc: string }> {
    const c = s.content[lang] || {};
    const arr = Array.isArray(c.items) ? c.items : [];
    return arr.map((it: any) => ({
      icon: (it && it.icon) || '',
      title: (it && it.title) || '',
      desc: (it && it.desc) || '',
    }));
  }

  addStep(s: EditableSection, lang: LangKey): void {
    const arr = this.getStepsArray(s, lang);
    arr.push({ icon: '✨', title: '', desc: '' });
    this.setCF(s, lang, 'items', arr);
  }

  updateStep(s: EditableSection, lang: LangKey, index: number, field: 'icon' | 'title' | 'desc', value: string): void {
    const arr = this.getStepsArray(s, lang);
    if (!arr[index]) return;
    arr[index] = { ...arr[index], [field]: value };
    this.setCF(s, lang, 'items', arr);
  }

  removeStep(s: EditableSection, lang: LangKey, index: number): void {
    const arr = this.getStepsArray(s, lang);
    arr.splice(index, 1);
    this.setCF(s, lang, 'items', arr);
  }

  /* ---------- warning-list helpers (structured editor) ---------- */
  getWarningItems(s: EditableSection, lang: LangKey): Array<{ text: string; children: string[] }> {
    const c = s.content[lang] || {};
    const arr = Array.isArray(c.items) ? c.items : [];
    return arr.map((it: any) => ({
      text: (it && it.text) || '',
      children: Array.isArray(it?.children) ? [...it.children] : [],
    }));
  }

  private setWarningItems(s: EditableSection, lang: LangKey, arr: Array<{ text: string; children: string[] }>): void {
    // Persist a clean shape (drop empty children arrays for cleaner JSON).
    const clean = arr.map(it => {
      const out: any = { text: it.text };
      if (it.children && it.children.length) out.children = it.children;
      return out;
    });
    this.setCF(s, lang, 'items', clean);
  }

  addWarningItem(s: EditableSection, lang: LangKey): void {
    const arr = this.getWarningItems(s, lang);
    arr.push({ text: '', children: [] });
    this.setWarningItems(s, lang, arr);
  }

  updateWarningItemText(s: EditableSection, lang: LangKey, index: number, value: string): void {
    const arr = this.getWarningItems(s, lang);
    if (!arr[index]) return;
    arr[index] = { ...arr[index], text: value };
    this.setWarningItems(s, lang, arr);
  }

  removeWarningItem(s: EditableSection, lang: LangKey, index: number): void {
    const arr = this.getWarningItems(s, lang);
    arr.splice(index, 1);
    this.setWarningItems(s, lang, arr);
  }

  moveWarningItem(s: EditableSection, lang: LangKey, index: number, dir: -1 | 1): void {
    const arr = this.getWarningItems(s, lang);
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    this.setWarningItems(s, lang, arr);
  }

  addWarningChild(s: EditableSection, lang: LangKey, index: number): void {
    const arr = this.getWarningItems(s, lang);
    if (!arr[index]) return;
    arr[index] = { ...arr[index], children: [...(arr[index].children || []), ''] };
    this.setWarningItems(s, lang, arr);
  }

  updateWarningChild(s: EditableSection, lang: LangKey, index: number, childIndex: number, value: string): void {
    const arr = this.getWarningItems(s, lang);
    if (!arr[index]) return;
    const children = [...(arr[index].children || [])];
    children[childIndex] = value;
    arr[index] = { ...arr[index], children };
    this.setWarningItems(s, lang, arr);
  }

  removeWarningChild(s: EditableSection, lang: LangKey, index: number, childIndex: number): void {
    const arr = this.getWarningItems(s, lang);
    if (!arr[index]) return;
    const children = [...(arr[index].children || [])];
    children.splice(childIndex, 1);
    arr[index] = { ...arr[index], children };
    this.setWarningItems(s, lang, arr);
  }

  /* Content field getter/setter for current lang */
  getCF(s: EditableSection, lang: LangKey, key: string): any {
    const c = s.content[lang] || {};
    return c[key];
  }
  setCF(s: EditableSection, lang: LangKey, key: string, value: any) {
    const c = { ...(s.content[lang] || {}) };
    c[key] = value;
    s.content[lang] = c;
    this.markDirty(s);
  }
  setMeta(s: EditableSection, key: string, value: any) {
    s.meta = { ...(s.meta || {}), [key]: value };
    this.markDirty(s);
  }

  /* list helpers */
  linesToText(items: any): string {
    if (!Array.isArray(items)) return '';
    return items.join('\n');
  }
  textToLines(text: string): string[] {
    return (text || '').split('\n').map(l => l.trim()).filter(l => l.length);
  }

  /* warning-list helpers */
  warningItemsToText(items: any): string {
    if (!Array.isArray(items)) return '';
    const lines: string[] = [];
    for (const it of items) {
      if (!it) continue;
      lines.push(it.text || '');
      for (const ch of (it.children || [])) lines.push('- ' + ch);
    }
    return lines.join('\n');
  }
  textToWarningItems(text: string): any[] {
    const lines = (text || '').split('\n');
    const result: any[] = [];
    let current: any = null;
    for (const raw of lines) {
      const line = raw.replace(/\s+$/,'');
      if (!line.trim()) continue;
      if (line.startsWith('- ') || line.startsWith('  ')) {
        const child = line.replace(/^-\s?|^\s+/, '').trim();
        if (current) (current.children ||= []).push(child);
        else result.push({ text: child });
      } else {
        current = { text: line.trim() };
        result.push(current);
      }
    }
    return result;
  }

  /* Actions */
  moveUp(i: number) {
    if (i === 0) return;
    [this.sections[i - 1], this.sections[i]] = [this.sections[i], this.sections[i - 1]];
    this.persistOrder();
  }
  moveDown(i: number) {
    if (i === this.sections.length - 1) return;
    [this.sections[i], this.sections[i + 1]] = [this.sections[i + 1], this.sections[i]];
    this.persistOrder();
  }
  private persistOrder() {
    this.sections.forEach((s, idx) => (s.order = (idx + 1) * 10));
    const items = this.sections
      .filter(s => s.id)
      .map(s => ({ id: s.id as number, order: s.order }));
    this.api.reorderPageSections(items).subscribe({
      next: () => this.showOk('Kolejność zapisana.'),
      error: () => this.showError('Nie udało się zapisać kolejności.'),
    });
  }

  onFileSelected(event: Event, s: EditableSection) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    s._uploading = true;
    this.api.uploadPageSectionImage(file).subscribe({
      next: (res: any) => {
        s.image_url = res.image_url;
        s._uploading = false;
        this.markDirty(s);
        this.showOk('Zdjęcie wgrane. Pamiętaj zapisać sekcję.');
      },
      error: () => {
        s._uploading = false;
        this.showError('Błąd uploadu zdjęcia.');
      },
    });
  }

  save(s: EditableSection) {
    // Najpierw automatyczne tłumaczenie PL → EN/FI, potem zapis do API.
    this.translateSectionFromPl(s).then(() => {
      this.persist(s);
    }).catch((err) => {
      console.error('Auto-translate failed', err);
      this.showError('Błąd auto-tłumaczenia — zapisano tylko PL. Uruchom ponownie „Zapisz" lub wpisz tłumaczenia ręcznie.');
      // i tak zapisz to co mamy (PL)
      this.persist(s);
    });
  }

  private persist(s: EditableSection) {
    s._saving = true;
    const payload = this.toPayload(s);
    const req = s.id
      ? this.api.updatePageSection(s.id, payload)
      : this.api.createPageSection(payload);
    req.subscribe({
      next: (res: any) => {
        Object.assign(s, this.normalize(res));
        s._dirty = false;
        s._saving = false;
        s._expanded = true;
        s._activeLang = s._activeLang || 'pl';
        this.showOk('Zmiany zapisane! Tłumaczenia zaktualizowane.');
      },
      error: (err) => {
        s._saving = false;
        console.error(err);
        this.showError('Błąd zapisu: ' + (err?.error?.message || err?.statusText || 'nieznany'));
      },
    });
  }

  /**
   * Walk the PL content of a section and fill EN + FI by calling the
   * backend translation proxy (/admin/translate → MyMemory). Runs with
   * concurrency = 2 to be gentle on the free API.
   */
  private async translateSectionFromPl(s: EditableSection): Promise<void> {
    if (s._translating) return;

    // Collect (pl text, setter) pairs. Setter receives translated (en, fi).
    type Job = { pl: string; setEn: (v: string) => void; setFi: (v: string) => void };
    const jobs: Job[] = [];

    // Prepare target buckets (start from current values, so manual edits in EN/FI
    // that don't correspond to a PL source are preserved).
    const newTitle = { ...s.title };
    const newSubtitle = { ...s.subtitle };
    const newBody = { ...s.body };
    // Deep clone PL content as base for EN/FI (we'll replace strings inside).
    const plContent = s.content.pl ?? {};
    const enContent = JSON.parse(JSON.stringify(plContent));
    const fiContent = JSON.parse(JSON.stringify(plContent));
    const newMeta = { ...(s.meta || {}) };

    const pushText = (pl: any, setEn: (v: string) => void, setFi: (v: string) => void) => {
      if (typeof pl !== 'string' || pl.trim() === '') return;
      jobs.push({ pl, setEn, setFi });
    };

    pushText(s.title.pl, v => (newTitle.en = v), v => (newTitle.fi = v));
    pushText(s.subtitle.pl, v => (newSubtitle.en = v), v => (newSubtitle.fi = v));
    pushText(s.body.pl, v => (newBody.en = v), v => (newBody.fi = v));

    // Deep walk PL content — for each string, translate and write to en/fi clones at same path.
    const walk = (plNode: any, enNode: any, fiNode: any) => {
      if (plNode == null) return;
      if (Array.isArray(plNode)) {
        for (let i = 0; i < plNode.length; i++) {
          const v = plNode[i];
          if (typeof v === 'string') {
            pushText(v, nv => (enNode[i] = nv), nv => (fiNode[i] = nv));
          } else if (v && typeof v === 'object') {
            walk(v, enNode[i], fiNode[i]);
          }
        }
        return;
      }
      if (typeof plNode === 'object') {
        for (const k of Object.keys(plNode)) {
          const v = plNode[k];
          if (typeof v === 'string') {
            pushText(v, nv => (enNode[k] = nv), nv => (fiNode[k] = nv));
          } else if (v && typeof v === 'object') {
            walk(v, enNode[k], fiNode[k]);
          }
        }
      }
    };
    walk(plContent, enContent, fiContent);

    // Meta labels: *_pl → *_en, *_fi
    for (const k of Object.keys(newMeta)) {
      if (!/_pl$/.test(k)) continue;
      const v = newMeta[k];
      if (typeof v !== 'string' || !v.trim()) continue;
      const enKey = k.replace(/_pl$/, '_en');
      const fiKey = k.replace(/_pl$/, '_fi');
      pushText(v, nv => (newMeta[enKey] = nv), nv => (newMeta[fiKey] = nv));
    }

    if (jobs.length === 0) {
      // Nic do tłumaczenia — ale i tak wyrównaj struktury (puste EN/FI = PL).
      s.title = newTitle;
      s.subtitle = newSubtitle;
      s.body = newBody;
      s.content = { pl: plContent, en: enContent, fi: fiContent };
      s.meta = newMeta;
      return;
    }

    s._translating = true;
    s._translateProgress = `0/${jobs.length * 2}`;
    let done = 0;
    const total = jobs.length * 2;

    // concurrency queue
    const tasks: Array<() => Promise<void>> = [];
    for (const job of jobs) {
      tasks.push(async () => {
        try {
          const en = await this.translateOne(job.pl, 'pl', 'en');
          job.setEn(en);
        } catch {
          job.setEn(job.pl);
        } finally {
          done++;
          s._translateProgress = `${done}/${total}`;
        }
      });
      tasks.push(async () => {
        try {
          const fi = await this.translateOne(job.pl, 'pl', 'fi');
          job.setFi(fi);
        } catch {
          job.setFi(job.pl);
        } finally {
          done++;
          s._translateProgress = `${done}/${total}`;
        }
      });
    }

    const concurrency = 2;
    let idx = 0;
    const runners = Array.from({ length: concurrency }, async () => {
      while (idx < tasks.length) {
        const my = idx++;
        await tasks[my]();
      }
    });
    await Promise.all(runners);

    // Commit translated buckets back to the section.
    s.title = newTitle;
    s.subtitle = newSubtitle;
    s.body = newBody;
    s.content = { pl: plContent, en: enContent, fi: fiContent };
    s.meta = newMeta;
    s._translating = false;
    s._translateProgress = '';
  }

  deleteSection(s: EditableSection) {
    if (!confirm(`Usunąć sekcję „${s.section_key}"?`)) return;
    if (!s.id) {
      this.sections = this.sections.filter(x => x !== s);
      return;
    }
    this.api.deletePageSection(s.id).subscribe({
      next: () => {
        this.sections = this.sections.filter(x => x !== s);
        this.showOk('Usunięto.');
      },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  addSection() {
    const maxOrder = this.sections.reduce((m, s) => Math.max(m, s.order), 0);
    const s: EditableSection = {
      page_key: this.pageKey,
      section_key: this.newKey.trim(),
      type: this.newType,
      order: maxOrder + 10,
      is_active: true,
      image_url: null,
      title: { pl: '', en: '', fi: '' },
      subtitle: { pl: '', en: '', fi: '' },
      body: { pl: '', en: '', fi: '' },
      content: { pl: {}, en: {}, fi: {} },
      meta: {},
      _dirty: true,
      _expanded: true,
      _activeLang: 'pl',
    };
    this.sections.push(s);
    this.newKey = '';
    this.save(s);
  }

  private toPayload(s: EditableSection): any {
    return {
      page_key: s.page_key,
      section_key: s.section_key,
      type: s.type,
      order: s.order,
      is_active: s.is_active,
      image_url: s.image_url,
      title: s.title,
      subtitle: s.subtitle,
      body: s.body,
      content: s.content,
      meta: s.meta,
    };
  }

  private showOk(msg: string) { this.message = msg; this.isError = false; setTimeout(() => this.message = '', 4500); }
  private showError(msg: string) { this.message = msg; this.isError = true; }
}


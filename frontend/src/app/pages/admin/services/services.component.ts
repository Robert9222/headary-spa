import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { ContentService } from '@services/content.service';

type LangKey = 'pl' | 'en' | 'fi';
const LANGS: LangKey[] = ['pl', 'en', 'fi'];

interface AdminService {
  id?: number;
  name: { pl: string; en: string; fi: string };
  category: string;
  description: { pl: string; en: string; fi: string };
  duration_minutes: number;
  price: number;
  image_url: string;
  order: number;
  is_active: boolean;
  _saving?: boolean;
  _uploading?: boolean;
  _activeLang?: LangKey;
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Usługi</h1>
        <p class="lead">Definiuj ofertę salonu: nazwy, kategorie, ceny i czas trwania (PL / EN / FI).</p>
      </div>
      <div class="actions">
        <button class="btn primary" (click)="openCreate()">+ Nowa usługa</button>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie…</div>

    <div *ngIf="!loading && items.length === 0" class="empty">
      <div class="icon">✿</div>
      <h3 style="margin: 0 0 0.5rem;">Brak usług</h3>
      <p>Dodaj pierwszą usługę, aby pojawiła się na stronie.</p>
    </div>

    <div class="card" style="padding: 0;" *ngIf="!loading && items.length">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 80px;">Zdjęcie</th>
              <th>Nazwa (PL)</th>
              <th>Kategoria</th>
              <th style="text-align:right;">Cena</th>
              <th>Czas</th>
              <th>Status</th>
              <th style="width: 160px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of items">
              <td>
                <img *ngIf="it.image_url" [src]="content.resolveImage(it.image_url)" class="thumb" alt="" />
                <div *ngIf="!it.image_url" class="thumb" style="display:grid;place-items:center;color:#cbbfa8;">✿</div>
              </td>
              <td>
                <strong>{{ displayName(it) }}</strong>
                <div *ngIf="!it.name.pl" style="color:#b58300; font-size:0.75rem; margin-top:0.2rem;">⚠ Brak tłumaczenia PL — wyświetla EN/FI</div>
                <div style="color:#8a817a; font-size:0.8rem; margin-top:0.2rem;">{{ displayDesc(it) | slice:0:80 }}{{ (displayDesc(it)?.length || 0) > 80 ? '…' : '' }}</div>
              </td>
              <td><span class="badge muted" *ngIf="it.category">{{ it.category }}</span></td>
              <td style="text-align:right; font-weight:600;">{{ it.price }} zł</td>
              <td>{{ it.duration_minutes }} min</td>
              <td>
                <span class="badge" [class.ok]="it.is_active" [class.danger]="!it.is_active">
                  {{ it.is_active ? 'aktywna' : 'ukryta' }}
                </span>
              </td>
              <td>
                <button class="btn ghost sm" (click)="openEdit(it)">Edytuj</button>
                <button class="btn danger sm" (click)="remove(it)">Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2>{{ editing.id ? 'Edytuj usługę' : 'Nowa usługa' }}</h2>
          <button class="close" (click)="editing=null">×</button>
        </div>
        <div class="modal-body">
          <div class="uploader">
            <div class="preview">
              <img *ngIf="editing.image_url" [src]="content.resolveImage(editing.image_url)" alt="" />
              <span *ngIf="!editing.image_url">📷</span>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:0.6rem;">
              <label class="btn ghost file-btn">
                {{ editing._uploading ? 'Wysyłanie…' : 'Wgraj zdjęcie' }}
                <input type="file" accept="image/*" (change)="onFile($event)" hidden [disabled]="!!editing._uploading" />
              </label>
              <input class="url-input" [(ngModel)]="editing.image_url" placeholder="lub wklej URL" />
            </div>
          </div>

          <!-- Language tabs for translatable fields -->
          <div class="lang-tabs" style="display:flex; gap:0.4rem; margin: 1.25rem 0 0.75rem; border-bottom:1px solid #ebe6dd;">
            <button type="button"
                    *ngFor="let l of langs"
                    class="lang-tab"
                    [class.active]="(editing._activeLang || 'pl') === l"
                    (click)="editing._activeLang = l"
                    [style.font-weight]="(editing._activeLang || 'pl') === l ? 700 : 500"
                    style="padding:0.5rem 1rem; background:transparent; border:none; border-bottom:2px solid transparent; cursor:pointer; color:#5a4a1f;"
                    [style.borderBottomColor]="(editing._activeLang || 'pl') === l ? '#C9A96E' : 'transparent'">
              {{ l.toUpperCase() }}
              <span *ngIf="hasLang(editing, l)" style="color:#7b9e89; margin-left:0.25rem;">●</span>
            </button>
            <span style="margin-left:auto; color:#8a817a; font-size:0.8rem; align-self:center;">
              Wpisz wszystkie języki, aby strona działała poprawnie w PL/EN/FI.
            </span>
          </div>

          <div class="form-grid cols-2">
            <ng-container *ngFor="let l of langs">
              <ng-container *ngIf="(editing._activeLang || 'pl') === l">
                <div class="field full">
                  <label>Nazwa usługi ({{ l.toUpperCase() }}) {{ l === 'pl' ? '*' : '' }}</label>
                  <input [(ngModel)]="editing.name[l]" />
                </div>
                <div class="field full">
                  <label>Opis ({{ l.toUpperCase() }})</label>
                  <textarea rows="4" [(ngModel)]="editing.description[l]"></textarea>
                </div>
              </ng-container>
            </ng-container>

            <div class="field">
              <label>Kategoria</label>
              <input [(ngModel)]="editing.category" placeholder="np. masaż, zabieg na twarz" />
            </div>
            <div class="field">
              <label>Kolejność</label>
              <input type="number" [(ngModel)]="editing.order" />
            </div>
            <div class="field">
              <label>Cena (zł) *</label>
              <input type="number" step="0.01" [(ngModel)]="editing.price" />
            </div>
            <div class="field">
              <label>Czas trwania (min) *</label>
              <input type="number" [(ngModel)]="editing.duration_minutes" />
            </div>
            <label class="field checkbox full">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              <span class="label">Aktywna (widoczna na stronie)</span>
            </label>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn ghost" (click)="editing=null">Anuluj</button>
          <button class="btn primary" (click)="save()" [disabled]="editing._saving || !canSave()">
            {{ editing._saving ? 'Zapisywanie…' : 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
})
export class AdminServicesComponent implements OnInit {
  private api = inject(ApiService);
  public content = inject(ContentService);

  items: AdminService[] = [];
  loading = true;
  message = '';
  isError = false;
  editing: AdminService | null = null;
  langs = LANGS;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    this.api.getServices().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((x: any) => this.normalize(x))
          .sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać usług.'); }
    });
  }

  private normalize(x: any): AdminService {
    const tl = (v: any) => {
      if (v == null) return { pl: '', en: '', fi: '' };
      if (typeof v === 'string') return { pl: '', en: v, fi: '' };
      return { pl: v.pl || '', en: v.en || '', fi: v.fi || '' };
    };
    return {
      id: x.id,
      name: tl(x.name),
      category: x.category || '',
      description: tl(x.description),
      duration_minutes: x.duration_minutes || 60,
      price: +x.price || 0,
      image_url: x.image_url || '',
      order: x.order ?? 0,
      is_active: !!x.is_active,
    };
  }

  /** Wyświetlana nazwa w liście — preferujemy PL, fallback do EN/FI. */
  displayName(it: AdminService): string {
    return it.name.pl || it.name.en || it.name.fi || '';
  }

  displayDesc(it: AdminService): string {
    return it.description.pl || it.description.en || it.description.fi || '';
  }

  hasLang(it: AdminService, l: LangKey): boolean {
    return !!(it.name[l]?.trim() || it.description[l]?.trim());
  }

  openCreate(): void {
    const maxOrder = this.items.reduce((m, i) => Math.max(m, i.order), 0);
    this.editing = {
      name: { pl: '', en: '', fi: '' },
      category: '',
      description: { pl: '', en: '', fi: '' },
      duration_minutes: 60,
      price: 0,
      image_url: '',
      order: maxOrder + 1,
      is_active: true,
      _activeLang: 'pl',
    };
  }

  openEdit(it: AdminService): void {
    this.editing = { ...it, name: { ...it.name }, description: { ...it.description }, _activeLang: 'pl' };
  }

  canSave(): boolean {
    if (!this.editing) return false;
    const hasName = !!(this.editing.name.pl || this.editing.name.en || this.editing.name.fi);
    return hasName && this.editing.price >= 0 && this.editing.duration_minutes > 0;
  }

  onFile(ev: Event): void {
    if (!this.editing) return;
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editing._uploading = true;
    this.api.uploadImage(file, 'services').subscribe({
      next: (res: any) => {
        this.editing!.image_url = res.image_url;
        this.editing!._uploading = false;
      },
      error: () => {
        this.editing!._uploading = false;
        this.showError('Błąd uploadu.');
      }
    });
  }

  save(): void {
    if (!this.editing || !this.canSave()) return;
    const e = this.editing;
    e._saving = true;
    const cleanLocalized = (v: { pl: string; en: string; fi: string }) => {
      const out: any = {};
      if (v.pl?.trim()) out.pl = v.pl;
      if (v.en?.trim()) out.en = v.en;
      if (v.fi?.trim()) out.fi = v.fi;
      return out;
    };
    const payload: any = {
      name: cleanLocalized(e.name),
      category: e.category,
      description: cleanLocalized(e.description),
      duration_minutes: e.duration_minutes,
      price: e.price,
      image_url: e.image_url,
      order: e.order,
      is_active: e.is_active,
    };
    const req = e.id ? this.api.updateService(e.id, payload) : this.api.createService(payload);
    req.subscribe({
      next: () => { this.editing = null; this.showOk('Zapisano.'); this.reload(); },
      error: (err) => { e._saving = false; this.showError('Błąd zapisu: ' + (err?.error?.message || 'nieznany')); }
    });
  }

  remove(it: AdminService): void {
    if (!it.id) return;
    if (!confirm(`Usunąć usługę „${this.displayName(it)}"?`)) return;
    this.api.deleteService(it.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== it.id); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


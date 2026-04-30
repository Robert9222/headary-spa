import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { ContentService } from '@services/content.service';

interface AdminService {
  id?: number;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  order: number;
  is_active: boolean;
  _saving?: boolean;
  _uploading?: boolean;
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Usługi</h1>
        <p class="lead">Definiuj ofertę salonu: nazwy, kategorie, ceny i czas trwania.</p>
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
              <th>Nazwa</th>
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
                <strong>{{ it.name }}</strong>
                <div style="color:#8a817a; font-size:0.8rem; margin-top:0.2rem;">{{ it.description | slice:0:80 }}{{ (it.description?.length || 0) > 80 ? '…' : '' }}</div>
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

          <div class="form-grid cols-2" style="margin-top: 1rem;">
            <div class="field full">
              <label>Nazwa usługi *</label>
              <input [(ngModel)]="editing.name" />
            </div>
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
            <div class="field full">
              <label>Opis</label>
              <textarea rows="4" [(ngModel)]="editing.description"></textarea>
            </div>
            <label class="field checkbox">
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

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    this.api.getServices().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((x: any) => ({
          id: x.id,
          name: typeof x.name === 'object' ? (x.name.pl || x.name.en || '') : (x.name || ''),
          category: x.category || '',
          description: typeof x.description === 'object' ? (x.description.pl || x.description.en || '') : (x.description || ''),
          duration_minutes: x.duration_minutes || 60,
          price: +x.price || 0,
          image_url: x.image_url || '',
          order: x.order ?? 0,
          is_active: !!x.is_active,
        })).sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać usług.'); }
    });
  }

  openCreate(): void {
    const maxOrder = this.items.reduce((m, i) => Math.max(m, i.order), 0);
    this.editing = {
      name: '', category: '', description: '', duration_minutes: 60,
      price: 0, image_url: '', order: maxOrder + 1, is_active: true,
    };
  }

  openEdit(it: AdminService): void { this.editing = { ...it }; }

  canSave(): boolean {
    if (!this.editing) return false;
    return !!this.editing.name && this.editing.price >= 0 && this.editing.duration_minutes > 0;
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
    const payload = {
      name: e.name, category: e.category, description: e.description,
      duration_minutes: e.duration_minutes, price: e.price,
      image_url: e.image_url, order: e.order, is_active: e.is_active,
    };
    const req = e.id ? this.api.updateService(e.id, payload) : this.api.createService(payload);
    req.subscribe({
      next: () => { this.editing = null; this.showOk('Zapisano.'); this.reload(); },
      error: (err) => { e._saving = false; this.showError('Błąd zapisu: ' + (err?.error?.message || 'nieznany')); }
    });
  }

  remove(it: AdminService): void {
    if (!it.id) return;
    if (!confirm(`Usunąć usługę „${it.name}"?`)) return;
    this.api.deleteService(it.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== it.id); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


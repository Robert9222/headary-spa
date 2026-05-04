import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '@services/api.service';

interface AdminPackage {
  id?: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  service_ids: number[];
  is_active: boolean;
  _saving?: boolean;
}

interface ServiceOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Pakiety</h1>
        <p class="lead">Zestawy usług sprzedawane jako jeden produkt (cena, czas, lista usług).</p>
      </div>
      <div class="actions">
        <button class="btn primary" (click)="openCreate()">+ Nowy pakiet</button>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie…</div>

    <div *ngIf="!loading && items.length === 0" class="empty">
      <div class="icon">🎁</div>
      <h3 style="margin: 0 0 0.5rem;">Brak pakietów</h3>
      <p>Stwórz pierwszy pakiet, aby pojawił się w ofercie.</p>
    </div>

    <div class="card" style="padding: 0;" *ngIf="!loading && items.length">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Opis</th>
              <th>Usługi</th>
              <th style="text-align:right;">Cena</th>
              <th>Czas</th>
              <th>Status</th>
              <th style="width: 160px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of items">
              <td><strong>{{ it.name }}</strong></td>
              <td style="color:#8a817a; font-size:0.85rem;">
                {{ (it.description || '') | slice:0:90 }}{{ (it.description?.length || 0) > 90 ? '…' : '' }}
              </td>
              <td>
                <span class="badge muted" *ngFor="let sid of it.service_ids" style="margin-right:0.25rem;">
                  {{ serviceLabel(sid) }}
                </span>
                <span *ngIf="!it.service_ids?.length" style="color:#cbbfa8;">—</span>
              </td>
              <td style="text-align:right; font-weight:600;">{{ it.price }} zł</td>
              <td>{{ it.duration_minutes }} min</td>
              <td>
                <span class="badge" [class.ok]="it.is_active" [class.danger]="!it.is_active">
                  {{ it.is_active ? 'aktywny' : 'ukryty' }}
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
          <h2>{{ editing.id ? 'Edytuj pakiet' : 'Nowy pakiet' }}</h2>
          <button class="close" (click)="editing=null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid cols-2">
            <div class="field full">
              <label>Nazwa pakietu *</label>
              <input [(ngModel)]="editing.name" />
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
            <div class="field full">
              <label>Usługi w pakiecie</label>
              <div class="services-picker">
                <label *ngFor="let s of services" class="service-chip"
                       [class.checked]="isServiceSelected(s.id)">
                  <input type="checkbox"
                         [checked]="isServiceSelected(s.id)"
                         (change)="toggleService(s.id, $event)" />
                  <span>{{ s.name }}</span>
                </label>
                <div *ngIf="!services.length" style="color:#8a817a; font-size:0.85rem;">
                  Brak zdefiniowanych usług. Dodaj je najpierw w sekcji „Usługi".
                </div>
              </div>
            </div>
            <label class="field checkbox">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              <span class="label">Aktywny (widoczny w ofercie)</span>
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
  styles: [`
    .services-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .service-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.8rem; border-radius: 999px;
      border: 1px solid #e5dfd2; background: #faf7f2;
      cursor: pointer; font-size: 0.85rem; user-select: none;
      transition: all 0.15s;
    }
    .service-chip input { accent-color: #C9A96E; }
    .service-chip:hover { border-color: #C9A96E; }
    .service-chip.checked { background: #f3e9d4; border-color: #C9A96E; color: #2d2a26; }
  `]
})
export class AdminPackagesComponent implements OnInit {
  private api = inject(ApiService);

  items: AdminPackage[] = [];
  services: ServiceOption[] = [];
  loading = true;
  message = '';
  isError = false;
  editing: AdminPackage | null = null;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    forkJoin({
      pkgs: this.api.getPackages(),
      svcs: this.api.getServices(),
    }).subscribe({
      next: (r: any) => {
        this.services = (r.svcs || []).map((x: any) => ({
          id: x.id,
          name: typeof x.name === 'object' ? (x.name.pl || x.name.en || `#${x.id}`) : (x.name || `#${x.id}`),
        }));
        this.items = (r.pkgs || []).map((x: any) => ({
          id: x.id,
          name: typeof x.name === 'object' ? (x.name.pl || x.name.en || '') : (x.name || ''),
          description: typeof x.description === 'object' ? (x.description.pl || x.description.en || '') : (x.description || ''),
          price: +x.price || 0,
          duration_minutes: x.duration_minutes || 60,
          service_ids: Array.isArray(x.service_ids) ? x.service_ids.map((n: any) => +n) : [],
          is_active: !!x.is_active,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać pakietów.'); }
    });
  }

  serviceLabel(id: number): string {
    return this.services.find(s => s.id === id)?.name || `#${id}`;
  }

  openCreate(): void {
    this.editing = {
      name: '', description: '', price: 0,
      duration_minutes: 60, service_ids: [], is_active: true,
    };
  }

  openEdit(it: AdminPackage): void {
    this.editing = { ...it, service_ids: [...(it.service_ids || [])] };
  }

  isServiceSelected(id: number): boolean {
    return !!this.editing && this.editing.service_ids.includes(id);
  }

  toggleService(id: number, ev: Event): void {
    if (!this.editing) return;
    const checked = (ev.target as HTMLInputElement).checked;
    const set = new Set(this.editing.service_ids);
    if (checked) set.add(id); else set.delete(id);
    this.editing.service_ids = Array.from(set);
  }

  canSave(): boolean {
    if (!this.editing) return false;
    return !!this.editing.name && this.editing.price >= 0 && this.editing.duration_minutes > 0;
  }

  save(): void {
    if (!this.editing || !this.canSave()) return;
    const e = this.editing;
    e._saving = true;
    const payload: any = {
      name: e.name,
      description: e.description,
      price: e.price,
      duration_minutes: e.duration_minutes,
      service_ids: e.service_ids,
      is_active: e.is_active,
    };
    const req = e.id ? this.api.updatePackage(e.id, payload) : this.api.createPackage(payload);
    req.subscribe({
      next: () => { this.editing = null; this.showOk('Zapisano.'); this.reload(); },
      error: (err) => {
        e._saving = false;
        const msg = err?.error?.message || (err?.error?.errors ? Object.values(err.error.errors).flat().join(', ') : 'nieznany');
        this.showError('Błąd zapisu: ' + msg);
      }
    });
  }

  remove(it: AdminPackage): void {
    if (!it.id) return;
    if (!confirm(`Usunąć pakiet „${it.name}"?`)) return;
    this.api.deletePackage(it.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== it.id); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';

interface AdminSetting {
  id?: number;
  key: string;
  value: any;
  description: string;
  _saving?: boolean;
  _editing?: boolean;
  _draft?: { value: string; description: string };
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Ustawienia</h1>
        <p class="lead">Globalne ustawienia aplikacji (klucz–wartość).</p>
      </div>
      <div class="actions">
        <button class="btn primary" (click)="openCreate()">+ Nowe ustawienie</button>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie…</div>
    <div *ngIf="!loading && items.length === 0 && !editing" class="empty">
      <div class="icon">⚙</div>
      <p>Brak ustawień. Kliknij „+ Nowe ustawienie", aby dodać.</p>
    </div>

    <div class="card" style="padding: 0;" *ngIf="!loading && items.length">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 25%;">Klucz</th>
              <th>Wartość</th>
              <th style="width: 25%;">Opis</th>
              <th style="width: 160px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of items">
              <td><code>{{ it.key }}</code></td>
              <td>
                <span *ngIf="!it._editing" class="setting-value">{{ formatValue(it.value) }}</span>
                <textarea *ngIf="it._editing" rows="2" [(ngModel)]="it._draft!.value"></textarea>
              </td>
              <td>
                <span *ngIf="!it._editing" style="color:#8a817a; font-size:0.85rem;">{{ it.description || '—' }}</span>
                <input *ngIf="it._editing" [(ngModel)]="it._draft!.description" placeholder="opis…" />
              </td>
              <td>
                <ng-container *ngIf="!it._editing">
                  <button class="btn ghost sm" (click)="startEdit(it)">Edytuj</button>
                  <button class="btn danger sm" (click)="remove(it)">Usuń</button>
                </ng-container>
                <ng-container *ngIf="it._editing">
                  <button class="btn primary sm" (click)="saveEdit(it)" [disabled]="it._saving">
                    {{ it._saving ? '…' : 'Zapisz' }}
                  </button>
                  <button class="btn ghost sm" (click)="cancelEdit(it)">Anuluj</button>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL - new -->
    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2>Nowe ustawienie</h2>
          <button class="close" (click)="editing=null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Klucz *</label>
              <input [(ngModel)]="editing.key" placeholder="np. contact_phone" />
              <p class="hint">Bez spacji, małe litery/podkreślniki. Klucz jest unikalny.</p>
            </div>
            <div class="field">
              <label>Wartość *</label>
              <textarea rows="3" [(ngModel)]="editing.value"></textarea>
            </div>
            <div class="field">
              <label>Opis (opcjonalny)</label>
              <input [(ngModel)]="editing.description" />
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn ghost" (click)="editing=null">Anuluj</button>
          <button class="btn primary" (click)="create()" [disabled]="!editing.key || editing._saving">
            {{ editing._saving ? 'Zapisywanie…' : 'Dodaj' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
  styles: [`
    .setting-value { font-family: 'Consolas', monospace; font-size: 0.85rem; white-space: pre-wrap; word-break: break-word; }
    code { background: #faf7f2; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #5a4a1f; }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private api = inject(ApiService);

  items: AdminSetting[] = [];
  loading = true;
  message = '';
  isError = false;
  editing: AdminSetting | null = null;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    this.api.getSettings().subscribe({
      next: (data: any) => {
        const arr: AdminSetting[] = [];
        if (Array.isArray(data)) {
          data.forEach(s => arr.push({ id: s.id, key: s.key, value: s.value, description: s.description || '' }));
        } else if (data && typeof data === 'object') {
          Object.keys(data).forEach(k => {
            const s = data[k];
            arr.push({ id: s.id, key: s.key || k, value: s.value, description: s.description || '' });
          });
        }
        this.items = arr.sort((a, b) => a.key.localeCompare(b.key));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać ustawień.'); }
    });
  }

  formatValue(v: any): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  }

  startEdit(it: AdminSetting): void {
    it._editing = true;
    it._draft = {
      value: typeof it.value === 'string' ? it.value : JSON.stringify(it.value),
      description: it.description || '',
    };
  }

  cancelEdit(it: AdminSetting): void { it._editing = false; it._draft = undefined; }

  saveEdit(it: AdminSetting): void {
    if (!it._draft) return;
    it._saving = true;
    this.api.updateSetting(it.key, { value: it._draft.value, description: it._draft.description }).subscribe({
      next: (res: any) => {
        it.value = res.value;
        it.description = res.description || '';
        it._editing = false;
        it._saving = false;
        it._draft = undefined;
        this.showOk('Zapisano.');
      },
      error: () => { it._saving = false; this.showError('Błąd zapisu.'); }
    });
  }

  remove(it: AdminSetting): void {
    if (!confirm(`Usunąć ustawienie „${it.key}"?`)) return;
    this.api.deleteSetting(it.key).subscribe({
      next: () => { this.items = this.items.filter(x => x.key !== it.key); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  openCreate(): void {
    this.editing = { key: '', value: '', description: '' };
  }

  create(): void {
    if (!this.editing) return;
    const e = this.editing;
    e._saving = true;
    this.api.createSetting({ key: e.key, value: e.value, description: e.description }).subscribe({
      next: () => { this.editing = null; this.showOk('Dodano.'); this.reload(); },
      error: (err) => { e._saving = false; this.showError('Błąd: ' + (err?.error?.message || 'nieznany')); },
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { ContentService } from '@services/content.service';

interface AdminEmployee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  avatar_url: string;
  bio: string;
  is_active: boolean;
  _saving?: boolean;
  _uploading?: boolean;
}

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Zespół</h1>
        <p class="lead">Pracownicy widoczni na stronie: zdjęcia, opisy i kontakty.</p>
      </div>
      <div class="actions">
        <button class="btn primary" (click)="openCreate()">+ Nowy pracownik</button>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie…</div>
    <div *ngIf="!loading && items.length === 0" class="empty">
      <div class="icon">☺</div>
      <p>Brak pracowników. Dodaj pierwszego.</p>
    </div>

    <div class="grid cols-3" *ngIf="!loading && items.length">
      <div class="card emp-card" *ngFor="let it of items">
        <div class="emp-top">
          <img *ngIf="it.avatar_url" [src]="content.resolveImage(it.avatar_url)" class="avatar" alt="" />
          <div *ngIf="!it.avatar_url" class="avatar placeholder">{{ initials(it.name) }}</div>
          <div>
            <strong>{{ it.name }}</strong>
            <small>{{ it.specialization || '—' }}</small>
            <span class="badge" [class.ok]="it.is_active" [class.danger]="!it.is_active" style="margin-top:0.3rem;">
              {{ it.is_active ? 'aktywny' : 'nieaktywny' }}
            </span>
          </div>
        </div>
        <p class="bio" *ngIf="it.bio">{{ it.bio }}</p>
        <div class="contact">
          <span *ngIf="it.email">✉ {{ it.email }}</span>
          <span *ngIf="it.phone">☎ {{ it.phone }}</span>
        </div>
        <div class="actions">
          <button class="btn ghost sm" (click)="openEdit(it)">Edytuj</button>
          <button class="btn danger sm" (click)="remove(it)">Usuń</button>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2>{{ editing.id ? 'Edytuj pracownika' : 'Nowy pracownik' }}</h2>
          <button class="close" (click)="editing=null">×</button>
        </div>
        <div class="modal-body">
          <div class="uploader">
            <div class="preview" style="border-radius: 50%;">
              <img *ngIf="editing.avatar_url" [src]="content.resolveImage(editing.avatar_url)" alt="" />
              <span *ngIf="!editing.avatar_url">👤</span>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:0.6rem;">
              <label class="btn ghost file-btn">
                {{ editing._uploading ? 'Wysyłanie…' : 'Wgraj avatar' }}
                <input type="file" accept="image/*" (change)="onFile($event)" hidden [disabled]="!!editing._uploading" />
              </label>
              <input class="url-input" [(ngModel)]="editing.avatar_url" placeholder="lub wklej URL" />
            </div>
          </div>

          <div class="form-grid cols-2" style="margin-top: 1rem;">
            <div class="field">
              <label>Imię i nazwisko *</label>
              <input [(ngModel)]="editing.name" />
            </div>
            <div class="field">
              <label>Email *</label>
              <input type="email" [(ngModel)]="editing.email" />
            </div>
            <div class="field">
              <label>Telefon</label>
              <input [(ngModel)]="editing.phone" />
            </div>
            <div class="field">
              <label>Specjalizacja</label>
              <input [(ngModel)]="editing.specialization" placeholder="np. Kobido, masaż twarzy" />
            </div>
            <div class="field full">
              <label>Bio</label>
              <textarea rows="4" [(ngModel)]="editing.bio"></textarea>
            </div>
            <label class="field checkbox">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              <span class="label">Aktywny</span>
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
    .emp-card { display: flex; flex-direction: column; gap: 0.7rem; }
    .emp-top { display: flex; gap: 0.9rem; align-items: flex-start; }
    .emp-top div { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .emp-top strong { font-size: 1rem; }
    .emp-top small { color: #8a817a; font-size: 0.8rem; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #ebe6dd; flex-shrink: 0; }
    .avatar.placeholder { background: #E8DCC8; color: #5a4a1f; display: grid; place-items: center; font-weight: 700; }
    .bio { color: #5a524a; font-size: 0.88rem; line-height: 1.5; margin: 0; }
    .contact { display: flex; gap: 0.8rem; font-size: 0.82rem; color: #8a817a; flex-wrap: wrap; }
    .actions { display: flex; gap: 0.4rem; margin-top: 0.3rem; }
    .badge { width: fit-content; }
  `]
})
export class AdminEmployeesComponent implements OnInit {
  private api = inject(ApiService);
  public content = inject(ContentService);

  items: AdminEmployee[] = [];
  loading = true;
  message = '';
  isError = false;
  editing: AdminEmployee | null = null;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    this.api.getEmployees().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((x: any) => ({
          id: x.id,
          name: x.name || '',
          email: x.email || '',
          phone: x.phone || '',
          specialization: x.specialization || '',
          avatar_url: x.avatar_url || '',
          bio: x.bio || '',
          is_active: x.is_active ?? true,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showError('Nie udało się pobrać zespołu.'); }
    });
  }

  initials(name: string): string {
    return (name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  openCreate(): void {
    this.editing = {
      name: '', email: '', phone: '', specialization: '',
      avatar_url: '', bio: '', is_active: true,
    };
  }

  openEdit(it: AdminEmployee): void { this.editing = { ...it }; }

  canSave(): boolean {
    if (!this.editing) return false;
    return !!this.editing.name && !!this.editing.email;
  }

  onFile(ev: Event): void {
    if (!this.editing) return;
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editing._uploading = true;
    this.api.uploadImage(file, 'employees').subscribe({
      next: (res: any) => {
        this.editing!.avatar_url = res.image_url;
        this.editing!._uploading = false;
      },
      error: () => { this.editing!._uploading = false; this.showError('Błąd uploadu.'); }
    });
  }

  save(): void {
    if (!this.editing || !this.canSave()) return;
    const e = this.editing;
    e._saving = true;
    const payload = {
      name: e.name, email: e.email, phone: e.phone,
      specialization: e.specialization, avatar_url: e.avatar_url,
      bio: e.bio, is_active: e.is_active,
    };
    const req = e.id ? this.api.updateEmployee(e.id, payload) : this.api.createEmployee(payload);
    req.subscribe({
      next: () => { this.editing = null; this.showOk('Zapisano.'); this.reload(); },
      error: (err) => { e._saving = false; this.showError('Błąd zapisu: ' + (err?.error?.message || 'nieznany')); }
    });
  }

  remove(it: AdminEmployee): void {
    if (!it.id) return;
    if (!confirm(`Usunąć „${it.name}"?`)) return;
    this.api.deleteEmployee(it.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== it.id); this.showOk('Usunięto.'); },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


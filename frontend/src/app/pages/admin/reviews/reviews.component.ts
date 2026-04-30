import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';

type Lang = 'pl' | 'en' | 'fi';

interface AdminReview {
  id?: number;
  client_name: string;
  client_email: string;
  service_id: number | null;
  rating: number;
  content: { pl: string; en: string; fi: string };
  language: Lang;
  is_approved: boolean;
  is_featured: boolean;
  service?: { id: number; name: string };
  created_at?: string;
  _saving?: boolean;
}

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Opinie klientów</h1>
        <p class="lead">Dodawaj, edytuj, zatwierdzaj i promuj opinie wyświetlane na stronie.</p>
      </div>
      <div class="actions">
        <button class="btn primary" (click)="openCreate()">+ Nowa opinia</button>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie opinii…</div>

    <div *ngIf="!loading && reviews.length === 0" class="empty">
      <div class="icon">★</div>
      <h3 style="margin: 0 0 0.5rem;">Brak opinii</h3>
      <p>Kliknij „+ Nowa opinia", aby dodać pierwszą.</p>
    </div>

    <div class="grid cols-2" *ngIf="!loading && reviews.length">
      <div class="card review-card" *ngFor="let r of reviews">
        <div class="review-top">
          <div>
            <strong>{{ r.client_name }}</strong>
            <small>{{ r.service?.name || 'bez usługi' }} · {{ r.created_at | date:'dd.MM.yyyy' }}</small>
          </div>
          <div class="stars">
            <span *ngFor="let i of [1,2,3,4,5]" [class.filled]="i <= r.rating">★</span>
          </div>
        </div>

        <p class="review-text">{{ previewContent(r) }}</p>

        <div class="review-flags">
          <span class="badge" [class.ok]="r.is_approved" [class.warn]="!r.is_approved">
            {{ r.is_approved ? '✓ zatwierdzona' : '⏳ oczekuje' }}
          </span>
          <span class="badge ok" *ngIf="r.is_featured">★ wyróżniona</span>
          <span class="badge muted">{{ r.language?.toUpperCase() }}</span>
        </div>

        <div class="review-actions">
          <button class="btn ghost sm" (click)="openEdit(r)">Edytuj</button>
          <button class="btn ghost sm" (click)="toggleApproved(r)">
            {{ r.is_approved ? 'Cofnij zatw.' : 'Zatwierdź' }}
          </button>
          <button class="btn ghost sm" (click)="toggleFeatured(r)">
            {{ r.is_featured ? 'Usuń z wyróż.' : 'Wyróżnij' }}
          </button>
          <button class="btn danger sm" (click)="deleteReview(r)">Usuń</button>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-backdrop" *ngIf="editing" (click)="editing=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h2>{{ editing.id ? 'Edytuj opinię' : 'Nowa opinia' }}</h2>
          <button class="close" (click)="editing=null">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid cols-2">
            <div class="field">
              <label>Imię klienta *</label>
              <input [(ngModel)]="editing.client_name" placeholder="Anna K." />
            </div>
            <div class="field">
              <label>Email klienta *</label>
              <input type="email" [(ngModel)]="editing.client_email" placeholder="anna@example.com" />
            </div>
            <div class="field">
              <label>Usługa *</label>
              <select [(ngModel)]="editing.service_id">
                <option [ngValue]="null" disabled>— wybierz —</option>
                <option *ngFor="let s of services" [ngValue]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Język bazowy</label>
              <select [(ngModel)]="editing.language">
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="fi">Suomi</option>
              </select>
            </div>
            <div class="field full">
              <label>Ocena</label>
              <div class="stars input" style="font-size: 1.8rem;">
                <span *ngFor="let i of [1,2,3,4,5]"
                      class="star"
                      [class.filled]="i <= editing.rating"
                      (click)="editing.rating = i">★</span>
                <span style="margin-left: 0.7rem; color: #8a817a; font-size: 0.9rem; align-self: center;">
                  {{ editing.rating }}/5
                </span>
              </div>
            </div>
          </div>

          <h3 style="margin: 1.5rem 0 0.5rem; font-size: 0.95rem;">Treść opinii</h3>
          <div class="lang-tabs">
            <button type="button" *ngFor="let l of langs"
                    class="lang-tab"
                    [class.active]="activeLang === l"
                    (click)="activeLang = l">
              {{ l.toUpperCase() }}
              <span *ngIf="editing.content[l]?.trim()" style="color: #2e7d57;">●</span>
            </button>
          </div>
          <div class="field">
            <textarea rows="5"
                      [(ngModel)]="editing.content[activeLang]"
                      [placeholder]="'Treść w języku ' + activeLang.toUpperCase() + '…'"></textarea>
            <p class="hint">Wypełnij przynajmniej jeden język. Pozostałe mogą zostać puste — na froncie zadziała fallback.</p>
          </div>

          <div class="form-grid cols-2" style="margin-top: 1rem;">
            <label class="field checkbox">
              <input type="checkbox" [(ngModel)]="editing.is_approved" />
              <span class="label">Zatwierdzona (widoczna publicznie)</span>
            </label>
            <label class="field checkbox">
              <input type="checkbox" [(ngModel)]="editing.is_featured" />
              <span class="label">Wyróżniona (sekcja „polecane")</span>
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
    .review-card { display: flex; flex-direction: column; gap: 0.7rem; }
    .review-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .review-top strong { display: block; font-size: 1rem; }
    .review-top small { color: #8a817a; font-size: 0.78rem; }
    .review-text {
      background: #faf7f2;
      border-left: 3px solid #C9A96E;
      padding: 0.7rem 0.9rem;
      border-radius: 4px;
      font-style: italic;
      color: #5a524a;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .review-flags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .review-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.3rem; }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private api = inject(ApiService);

  reviews: AdminReview[] = [];
  services: Array<{ id: number; name: string }> = [];
  loading = true;
  message = '';
  isError = false;

  langs: Lang[] = ['pl', 'en', 'fi'];
  activeLang: Lang = 'pl';
  editing: AdminReview | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.api.getServices().subscribe({
      next: (s: any[]) => this.services = (s || []).map((x: any) => ({ id: x.id, name: x.name })),
    });
    this.api.getReviews().subscribe({
      next: (data: any[]) => {
        this.reviews = (data || []).map(r => this.normalize(r));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Nie udało się pobrać opinii. Czy jesteś zalogowany jako admin?');
        this.loading = false;
      }
    });
  }

  private normalize(r: any): AdminReview {
    const c = r.content;
    const content = typeof c === 'string'
      ? { pl: c, en: '', fi: '' }
      : { pl: c?.pl || '', en: c?.en || '', fi: c?.fi || '' };
    return {
      id: r.id,
      client_name: r.client_name,
      client_email: r.client_email,
      service_id: r.service_id ?? null,
      rating: r.rating ?? 5,
      content,
      language: (r.language as Lang) || 'pl',
      is_approved: !!r.is_approved,
      is_featured: !!r.is_featured,
      service: r.service,
      created_at: r.created_at,
    };
  }

  previewContent(r: AdminReview): string {
    return r.content.pl || r.content.en || r.content.fi || '—';
  }

  openCreate(): void {
    this.editing = {
      client_name: '',
      client_email: '',
      service_id: this.services[0]?.id ?? null,
      rating: 5,
      content: { pl: '', en: '', fi: '' },
      language: 'pl',
      is_approved: true,
      is_featured: false,
    };
    this.activeLang = 'pl';
  }

  openEdit(r: AdminReview): void {
    this.editing = JSON.parse(JSON.stringify(r));
    this.activeLang = (this.editing!.language) || 'pl';
  }

  canSave(): boolean {
    if (!this.editing) return false;
    const e = this.editing;
    const hasContent = !!(e.content.pl || e.content.en || e.content.fi);
    return !!(e.client_name && e.client_email && e.service_id && e.rating >= 1 && hasContent);
  }

  save(): void {
    if (!this.editing || !this.canSave()) return;
    const e = this.editing;
    e._saving = true;
    const payload: any = {
      client_name: e.client_name,
      client_email: e.client_email,
      service_id: e.service_id,
      rating: e.rating,
      content: e.content,
      language: e.language,
      is_approved: e.is_approved,
      is_featured: e.is_featured,
    };
    const req = e.id ? this.api.updateReview(e.id, payload) : this.api.createReview(payload);
    req.subscribe({
      next: (res: any) => {
        const norm = this.normalize(res);
        if (e.id) {
          this.reviews = this.reviews.map(r => r.id === e.id ? norm : r);
        } else {
          this.reviews = [norm, ...this.reviews];
        }
        this.editing = null;
        this.showOk('Zapisano.');
      },
      error: (err) => {
        console.error(err);
        e._saving = false;
        this.showError('Błąd zapisu: ' + (err?.error?.message || err?.statusText || 'nieznany'));
      }
    });
  }

  toggleApproved(r: AdminReview): void {
    if (!r.id) return;
    this.api.updateReview(r.id, { is_approved: !r.is_approved }).subscribe({
      next: (res: any) => {
        const norm = this.normalize(res);
        this.reviews = this.reviews.map(x => x.id === r.id ? norm : x);
        this.showOk('Zmieniono status.');
      },
      error: () => this.showError('Nie udało się zmienić statusu.'),
    });
  }

  toggleFeatured(r: AdminReview): void {
    if (!r.id) return;
    this.api.updateReview(r.id, { is_featured: !r.is_featured }).subscribe({
      next: (res: any) => {
        const norm = this.normalize(res);
        this.reviews = this.reviews.map(x => x.id === r.id ? norm : x);
        this.showOk('Zmieniono wyróżnienie.');
      },
      error: () => this.showError('Nie udało się zmienić.'),
    });
  }

  deleteReview(r: AdminReview): void {
    if (!r.id) return;
    if (!confirm(`Usunąć opinię od „${r.client_name}"?`)) return;
    this.api.deleteReview(r.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(x => x.id !== r.id);
        this.showOk('Usunięto.');
      },
      error: () => this.showError('Błąd usuwania.'),
    });
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


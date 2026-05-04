import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { forkJoin } from 'rxjs';

interface StatCard {
  label: string;
  value: number | string;
  link: string;
  icon: string;
  accent?: string;
  sub?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-head">
      <div>
        <h1>Dashboard</h1>
        <p class="lead">Cześć, {{ currentUser?.name || 'Admin' }} — oto przegląd Twojego salonu.</p>
      </div>
    </div>

    <div class="grid cols-3" style="margin-bottom: 2rem;">
      <a *ngFor="let s of stats" [routerLink]="s.link" class="stat-card" [style.--accent]="s.accent">
        <div class="icon">{{ s.icon }}</div>
        <div class="meta">
          <span class="label">{{ s.label }}</span>
          <span class="value">{{ loading ? '…' : s.value }}</span>
        </div>
      </a>
    </div>

    <div class="grid cols-2">
      <div class="card">
        <h3 class="card-title">🚀 Szybkie akcje</h3>
        <div class="quick-actions">
          <a routerLink="/admin/pages/kobido/sections" class="action">
            <span>✎</span>
            <div><strong>Edytuj stronę Kobido</strong><small>Hero, opis, CTA…</small></div>
          </a>
          <a routerLink="/admin/reviews" class="action">
            <span>★</span>
            <div><strong>Dodaj nową opinię</strong><small>Podgląd, moderacja, featured</small></div>
          </a>
          <a routerLink="/admin/gallery" class="action">
            <span>▣</span>
            <div><strong>Wgraj zdjęcia do galerii</strong><small>Z podglądem i opisami</small></div>
          </a>
          <a routerLink="/admin/services" class="action">
            <span>✿</span>
            <div><strong>Zarządzaj usługami</strong><small>Cena, czas trwania, opis</small></div>
          </a>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">★ Ostatnie opinie</h3>
        <div *ngIf="loading" class="muted">Ładowanie…</div>
        <div *ngIf="!loading && recentReviews.length === 0" class="muted">Brak opinii.</div>
        <ul class="recent-list" *ngIf="!loading && recentReviews.length">
          <li *ngFor="let r of recentReviews">
            <div>
              <strong>{{ r.client_name || 'Anonim' }}</strong>
              <small>{{ (r.comment || r.content || '') | slice:0:80 }}{{ ((r.comment || r.content || '').length > 80 ? '…' : '') }}</small>
            </div>
            <span class="badge"
                  [class.ok]="r.is_approved"
                  [class.warn]="!r.is_approved">
              {{ r.is_approved ? 'zatwierdzona' : 'oczekuje' }}
            </span>
          </li>
        </ul>
        <a routerLink="/admin/reviews" class="btn ghost sm" style="margin-top: 1rem;">Wszystkie opinie →</a>
      </div>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
  styles: [`
    .stat-card {
      background: #fff; border: 1px solid #ebe6dd; border-radius: 12px;
      padding: 1.3rem; display: flex; align-items: center; gap: 1rem;
      text-decoration: none; color: inherit;
      transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
      --accent: #C9A96E;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(45, 42, 38, 0.08);
      border-color: var(--accent);
    }
    .stat-card .icon {
      width: 52px; height: 52px; border-radius: 12px;
      background: color-mix(in srgb, var(--accent) 15%, white);
      color: var(--accent);
      display: grid; place-items: center; font-size: 1.5rem; flex-shrink: 0;
    }
    .stat-card .meta { display: flex; flex-direction: column; }
    .stat-card .label { color: #8a817a; font-size: 0.82rem; font-weight: 500; }
    .stat-card .value { font-size: 1.9rem; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; color: #2d2a26; }
    .stat-card .sub { color: #8a817a; font-size: 0.74rem; margin-top: 0.1rem; }

    .quick-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    .action {
      display: flex; align-items: center; gap: 0.9rem;
      padding: 0.8rem 1rem; border-radius: 10px;
      background: #faf7f2; text-decoration: none; color: inherit;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .action:hover { background: #fff; border-color: #C9A96E; }
    .action > span { font-size: 1.4rem; color: #C9A96E; width: 28px; text-align: center; }
    .action div { display: flex; flex-direction: column; }
    .action strong { font-size: 0.92rem; }
    .action small { color: #8a817a; font-size: 0.78rem; }

    .recent-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .recent-list li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.7rem 0.9rem; border-radius: 8px; background: #faf7f2;
    }
    .recent-list div { display: flex; flex-direction: column; }
    .recent-list small { color: #8a817a; font-size: 0.78rem; }
    .muted { color: #8a817a; font-size: 0.9rem; padding: 0.5rem 0; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private api = inject(ApiService);

  currentUser: any = this.authService.getCurrentUser();
  loading = true;
  stats: StatCard[] = [
    { label: 'Usługi', value: 0, link: '/admin/services', icon: '✿', accent: '#C9A96E' },
    { label: 'Zespół', value: 0, link: '/admin/employees', icon: '☺', accent: '#a37ab5' },
    { label: 'Galeria', value: 0, link: '/admin/gallery', icon: '▣', accent: '#6a9bbf' },
    { label: 'Opinie', value: 0, link: '/admin/reviews', icon: '★', accent: '#c96e8c' },
  ];
  recentReviews: any[] = [];

  ngOnInit(): void {
    forkJoin({
      services: this.api.getServices(),
      gallery: this.api.getGallery(),
      employees: this.api.getEmployees(),
      reviews: this.api.getReviews(),
    }).subscribe({
      next: (r: any) => {
        // Stats: services, employees, gallery, reviews
        this.stats[0].value = r.services?.length ?? 0;
        this.stats[1].value = r.employees?.length ?? 0;
        this.stats[2].value = r.gallery?.length ?? 0;

        const reviews: any[] = r.reviews || [];
        const pendingReviews = reviews.filter(rv => !rv.is_approved).length;
        this.stats[3].value = reviews.length;
        this.stats[3].sub = pendingReviews ? `${pendingReviews} do moderacji` : '';

        this.recentReviews = [...reviews]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}

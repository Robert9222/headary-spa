import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PageEntry {
  key: string;
  label: string;
  description: string;
  publicPath: string;
}

@Component({
  selector: 'app-admin-pages-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-pages">
      <div class="header">
        <a routerLink="/admin/dashboard" class="back">← Dashboard</a>
        <h1>Strony</h1>
        <p>Wybierz stronę, której sekcje chcesz edytować.</p>
      </div>

      <div class="pages-grid">
        <div class="page-card" *ngFor="let p of pages">
          <h2>{{ p.label }}</h2>
          <p class="description">{{ p.description }}</p>
          <div class="actions">
            <a [routerLink]="['/admin/pages', p.key, 'sections']" class="btn primary">
              Edytuj sekcje
            </a>
            <a [href]="p.publicPath" target="_blank" class="btn ghost">Podgląd strony ↗</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 2rem 2.2rem; }
    .header { max-width: 1100px; margin: 0 auto 2rem; }
    .header .back { color: #666; text-decoration: none; font-size: 0.9rem; }
    .header h1 { margin: 0.5rem 0 0.3rem; font-family: var(--font-secondary, serif); color: var(--primary-color, #2d2a26); }
    .header p { color: #777; margin: 0; }
    .pages-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
    .page-card { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .page-card h2 { margin: 0 0 0.5rem; font-family: var(--font-secondary, serif); color: var(--primary-color, #2d2a26); }
    .description { color: #666; margin: 0 0 1.2rem; line-height: 1.5; }
    .actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .btn { padding: 0.6rem 1rem; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .btn.primary { background: var(--secondary-color, #C9A96E); color: #fff; }
    .btn.ghost { background: transparent; color: #555; border: 1px solid #ccc; }
  `]
})
export class PagesListComponent {
  pages: PageEntry[] = [
    {
      key: 'kobido',
      label: 'Kobido',
      description: 'Strona zabiegu Kobido: hero, opis, efekty, przeciwwskazania, przygotowanie, CTA.',
      publicPath: '/kobido',
    },
    {
      key: 'home',
      label: 'Strona główna',
      description: 'Sekcje strony głównej (hero, o nas, oferta, CTA).',
      publicPath: '/',
    },
    {
      key: 'headary-spa',
      label: 'Headary SPA',
      description: 'Strona „Headary SPA" — koncept, sekcje opisowe.',
      publicPath: '/headary-spa',
    },
  ];
}


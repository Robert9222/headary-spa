import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PageEntry {
  key: string;
  label: string;
  description: string;
  publicPath: string;
  /** Internal route for the editor or external admin module. */
  adminLink: any[];
  /** Button label for the primary action. */
  actionLabel: string;
  /** Visual hint about the editor flavour. */
  flavor: 'sections' | 'module';
  /** Additional note shown on the card (warnings / status). */
  note?: string;
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
        <p>Wybierz stronę lub moduł, którego treść chcesz edytować.</p>
      </div>

      <h2 class="group-title">📝 Strony edytowalne sekcjami (CMS)</h2>
      <p class="group-lead">
        Edytor sekcji pozwala dodawać/usuwać bloki, zmieniać teksty, obrazy i CTA.
        Wszystkie pola są dostępne w wersji PL / EN / FI z auto-tłumaczeniem.
      </p>
      <div class="pages-grid">
        <div class="page-card" *ngFor="let p of cmsPages">
          <span class="flavor-badge cms">CMS</span>
          <h2>{{ p.label }}</h2>
          <p class="description">{{ p.description }}</p>
          <p class="note" *ngIf="p.note">⚠ {{ p.note }}</p>
          <div class="actions">
            <a [routerLink]="p.adminLink" class="btn primary">{{ p.actionLabel }}</a>
            <a [href]="p.publicPath" target="_blank" class="btn ghost">Podgląd ↗</a>
          </div>
        </div>
      </div>

      <h2 class="group-title" style="margin-top: 2.5rem;">⚙ Moduły (zarządzanie listami)</h2>
      <p class="group-lead">
        Treść tych stron pochodzi z dedykowanych modułów — listy zabiegów, galeria zdjęć itp.
        Edytuj wpisy bezpośrednio w odpowiednich panelach.
      </p>
      <div class="pages-grid">
        <div class="page-card" *ngFor="let p of modulePages">
          <span class="flavor-badge module">MODUŁ</span>
          <h2>{{ p.label }}</h2>
          <p class="description">{{ p.description }}</p>
          <div class="actions">
            <a [routerLink]="p.adminLink" class="btn primary">{{ p.actionLabel }}</a>
            <a [href]="p.publicPath" target="_blank" class="btn ghost">Podgląd ↗</a>
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
    .group-title { max-width: 1100px; margin: 0 auto 0.4rem; font-family: var(--font-secondary, serif); color: var(--primary-color, #2d2a26); font-size: 1.15rem; }
    .group-lead { max-width: 1100px; margin: 0 auto 1rem; color: #777; font-size: 0.88rem; }
    .pages-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
    .page-card { position: relative; background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .page-card h2 { margin: 0 0 0.5rem; font-family: var(--font-secondary, serif); color: var(--primary-color, #2d2a26); }
    .description { color: #666; margin: 0 0 1rem; line-height: 1.5; font-size: 0.92rem; }
    .note { color: #b58300; background: #fff7e0; border: 1px solid #ffe7a8; padding: 0.45rem 0.6rem; border-radius: 6px; font-size: 0.8rem; margin: 0 0 1rem; line-height: 1.4; }
    .actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .btn { padding: 0.6rem 1rem; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .btn.primary { background: var(--secondary-color, #C9A96E); color: #fff; }
    .btn.ghost { background: transparent; color: #555; border: 1px solid #ccc; }
    .flavor-badge {
      position: absolute; top: 0.9rem; right: 0.9rem;
      padding: 0.15rem 0.55rem; border-radius: 999px;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
    }
    .flavor-badge.cms { background: #e8dcc8; color: #5a4a1f; }
    .flavor-badge.module { background: #d6e6dd; color: #2c5a44; }
  `]
})
export class PagesListComponent {
  /**
   * Strony oparte na rekordach `page_sections` w bazie. Edytor jest generyczny —
   * pozwala dodawać/usuwać/przesuwać dowolne sekcje per pageKey.
   */
  cmsPages: PageEntry[] = [
    {
      key: 'kobido',
      label: 'Kobido',
      description: 'Strona zabiegu Kobido: hero, opis, efekty, przeciwwskazania, przygotowanie, CTA.',
      publicPath: '/kobido',
      adminLink: ['/admin/pages', 'kobido', 'sections'],
      actionLabel: 'Edytuj sekcje',
      flavor: 'sections',
    },
    {
      key: 'home',
      label: 'Strona główna',
      description: 'Hero ze sliderem, powitanie, „o mnie", oferta zabiegów, „jak to wygląda", voucher, opinie.',
      publicPath: '/',
      adminLink: ['/admin/pages', 'home', 'sections'],
      actionLabel: 'Edytuj sekcje',
      flavor: 'sections',
    },
    {
      key: 'headary-spa',
      label: 'Headary SPA (FAQ)',
      description: 'Hero + sekcje FAQ: czym jest, efekty, dla kogo, przeciwwskazania, przygotowanie, CTA.',
      publicPath: '/headary-spa',
      adminLink: ['/admin/pages', 'headary-spa', 'sections'],
      actionLabel: 'Edytuj sekcje',
      flavor: 'sections',
    },
  ];

  /**
   * Strony zarządzane przez dedykowane moduły admina (lista zabiegów, galeria).
   * Dla nich nie używamy edytora sekcji — linkujemy bezpośrednio do listy.
   */
  modulePages: PageEntry[] = [
    {
      key: 'services',
      label: 'Lista zabiegów',
      description: 'Treść strony /services to dynamiczna lista zabiegów z bazy. Dodaj/edytuj wpisy w module „Usługi".',
      publicPath: '/services',
      adminLink: ['/admin/services'],
      actionLabel: 'Zarządzaj usługami →',
      flavor: 'module',
    },
    {
      key: 'gallery',
      label: 'Galeria',
      description: 'Strona /gallery wyświetla zdjęcia z bazy galerii. Wgraj/usuń zdjęcia w module „Galeria".',
      publicPath: '/gallery',
      adminLink: ['/admin/gallery'],
      actionLabel: 'Zarządzaj galerią →',
      flavor: 'module',
    },
  ];
}


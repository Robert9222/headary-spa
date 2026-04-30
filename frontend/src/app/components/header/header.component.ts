import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LanguageSwitcherComponent],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a class="logo" (click)="goHome()">
            <h1>Headary</h1>
            <p>SPA</p>
          </a>

          <nav class="nav">
            <a (click)="scrollTo('about-me')" class="nav-link">{{ translate('nav.about') }}</a>
            <a (click)="scrollTo('services')" class="nav-link">{{ translate('nav.services') }}</a>
            <a routerLink="/kobido" class="nav-link nav-link-highlight">Kobido</a>
            <a routerLink="/headary-spa" class="nav-link nav-link-highlight">Head SPA</a>
            <a (click)="scrollTo('reviews')" class="nav-link">{{ translate('reviews.title') }}</a>
            <a (click)="scrollTo('voucher')" class="nav-link">{{ translate('voucher.cta') }}</a>
            <a (click)="scrollTo('contact')" class="nav-link">{{ translate('nav.contact') }}</a>
          </nav>

          <div class="header-actions">
            <app-language-switcher></app-language-switcher>
            <a href="https://timma.no/salong/headary-spa" target="_blank" class="booking-btn">
              {{ translate('header.bookAppointment') }}
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      padding: 1.2rem 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      cursor: pointer;
      min-width: fit-content;
      flex-shrink: 0;
    }
    .logo h1 {
      margin: 0;
      font-size: 1.6rem;
      font-family: 'Playfair Display', serif;
      color: var(--primary-color, #8B6F47);
      font-weight: normal;
      letter-spacing: 2px;
    }
    .logo p {
      margin: 0;
      font-size: 0.75rem;
      color: #999;
      letter-spacing: 2px;
      font-weight: 300;
    }

    .nav {
      display: flex;
      gap: 1.6rem;
      flex: 1;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .nav-link {
      color: var(--primary-color, #8B6F47);
      text-decoration: none;
      transition: opacity 0.3s, color 0.3s;
      font-size: 0.95rem;
      letter-spacing: 0.3px;
      cursor: pointer;
      white-space: nowrap;
    }
    .nav-link:hover { opacity: 0.7; }

    .nav-link-highlight {
      color: var(--secondary-color, #C9A96E);
      font-weight: 600;
      position: relative;
    }
    .nav-link-highlight::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -5px;
      height: 2px;
      background: var(--secondary-color, #C9A96E);
      transform: scaleX(0.4);
      transition: transform .25s ease;
      transform-origin: center;
    }
    .nav-link-highlight:hover::after { transform: scaleX(1); opacity: 0.8; }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-shrink: 0;
    }

    .booking-btn {
      background: var(--primary-color, #8B6F47);
      color: white;
      padding: 0.7rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.3s, background 0.3s;
      font-size: 0.88rem;
      white-space: nowrap;
    }
    .booking-btn:hover {
      transform: scale(1.05);
      background: var(--secondary-color, #D4AF37);
      color: var(--primary-color, #8B6F47);
    }

    /* Tablet: zmniejsz gap i rozmiary, aby wszystko mieściło się w jednej linii dłużej */
    @media (max-width: 1100px) {
      .nav { gap: 1.1rem; }
      .nav-link { font-size: 0.88rem; }
      .logo h1 { font-size: 1.4rem; }
      .booking-btn { padding: 0.6rem 1.1rem; font-size: 0.82rem; }
    }

    /* Mobile */
    @media (max-width: 860px) {
      .header { padding: 0.9rem 0; }
      .header-content { flex-wrap: wrap; gap: 0.8rem; }
      .logo { order: 1; }
      .header-actions { order: 2; margin-left: auto; }
      .nav {
        order: 3;
        flex-basis: 100%;
        gap: 0.9rem 1.2rem;
        justify-content: center;
      }
      .nav-link { font-size: 0.85rem; }
    }
  `]
})
export class HeaderComponent {
  constructor(
    private translationService: TranslationService,
    private router: Router,
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  scrollTo(sectionId: string): void {
    // If we're not on the home page, navigate there first, then scroll after render.
    if (this.router.url !== '/' && !this.router.url.startsWith('/#')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToElement(sectionId), 80);
      });
      return;
    }
    this.scrollToElement(sectionId);
  }

  private scrollToElement(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goHome(): void {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

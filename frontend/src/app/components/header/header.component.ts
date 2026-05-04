import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
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

          <!-- Desktop nav -->
          <nav class="nav nav-desktop">
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
            <!-- Hamburger (mobile only) -->
            <button class="nav-toggle"
                    type="button"
                    [class.is-open]="menuOpen"
                    [attr.aria-expanded]="menuOpen"
                    aria-controls="mobile-drawer"
                    aria-label="Menu"
                    (click)="toggleMenu()">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile drawer -->
    <div class="drawer-overlay" [class.open]="menuOpen" (click)="closeMenu()"></div>
    <aside id="mobile-drawer"
           class="mobile-drawer"
           [class.open]="menuOpen"
           role="dialog"
           aria-modal="true">
      <div class="drawer-header">
        <a class="logo" (click)="goHome(); closeMenu()">
          <h1>Headary</h1>
          <p>SPA</p>
        </a>
        <button type="button" class="drawer-close" aria-label="Close menu" (click)="closeMenu()">✕</button>
      </div>
      <nav class="drawer-nav">
        <a (click)="scrollTo('about-me'); closeMenu()" class="drawer-link">{{ translate('nav.about') }}</a>
        <a (click)="scrollTo('services'); closeMenu()" class="drawer-link">{{ translate('nav.services') }}</a>
        <a routerLink="/kobido" (click)="closeMenu()" class="drawer-link drawer-link-highlight">Kobido</a>
        <a routerLink="/headary-spa" (click)="closeMenu()" class="drawer-link drawer-link-highlight">Head SPA</a>
        <a (click)="scrollTo('reviews'); closeMenu()" class="drawer-link">{{ translate('reviews.title') }}</a>
        <a (click)="scrollTo('voucher'); closeMenu()" class="drawer-link">{{ translate('voucher.cta') }}</a>
        <a (click)="scrollTo('contact'); closeMenu()" class="drawer-link">{{ translate('nav.contact') }}</a>
      </nav>
      <div class="drawer-footer">
        <a href="https://timma.no/salong/headary-spa" target="_blank" class="booking-btn drawer-cta" (click)="closeMenu()">
          {{ translate('header.bookAppointment') }}
        </a>
        <p class="drawer-contact">
          <a href="tel:+358411441220">📞 +358 41 144 1220</a><br>
          <a href="mailto:headaryspa@gmail.com">✉️ headaryspa&#64;gmail.com</a>
        </p>
      </div>
    </aside>
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
      line-height: 1;
      gap: 0.15rem;
    }
    .logo h1 {
      margin: 0;
      font-family: 'Noto Serif Display', 'DM Serif Display', 'Cormorant Garamond', Georgia, serif;
      font-stretch: 62.5%; /* ExtraCondensed — jak w oryginale logo */
      font-size: 2.6rem;
      font-weight: 300;
      color: #4a4642;
      letter-spacing: 0.5px;
      line-height: 1;
      font-feature-settings: "liga", "dlig";
    }
    .logo p {
      margin: 0;
      font-family: 'Noto Serif Display', 'DM Serif Display', 'Cormorant Garamond', Georgia, serif;
      font-stretch: 62.5%;
      font-size: 0.78rem;
      color: #6f655a;
      letter-spacing: 8px;
      text-indent: 8px; /* kompensacja letter-spacing dla wycentrowania */
      font-weight: 300;
      text-transform: uppercase;
      text-align: center;
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

    /* Hamburger button — domyślnie ukryty (desktop) */
    .nav-toggle {
      display: none;
      width: 44px;
      height: 44px;
      background: transparent;
      border: 0;
      padding: 0;
      cursor: pointer;
      position: relative;
    }
    .nav-toggle span {
      position: absolute;
      left: 10px;
      right: 10px;
      height: 2px;
      background: var(--primary-color, #8B6F47);
      border-radius: 2px;
      transition: transform .3s ease, opacity .25s ease, top .3s ease;
    }
    .nav-toggle span:nth-child(1) { top: 14px; }
    .nav-toggle span:nth-child(2) { top: 21px; }
    .nav-toggle span:nth-child(3) { top: 28px; }
    .nav-toggle.is-open span:nth-child(1) { top: 21px; transform: rotate(45deg); }
    .nav-toggle.is-open span:nth-child(2) { opacity: 0; }
    .nav-toggle.is-open span:nth-child(3) { top: 21px; transform: rotate(-45deg); }

    /* Drawer (mobile slide-in panel) */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 15, 15, 0.45);
      backdrop-filter: blur(2px);
      opacity: 0;
      visibility: hidden;
      transition: opacity .3s ease, visibility .3s ease;
      z-index: 199;
    }
    .drawer-overlay.open { opacity: 1; visibility: visible; }

    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: min(86vw, 360px);
      height: 100dvh;
      background: #fff;
      box-shadow: -10px 0 30px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform .35s cubic-bezier(.22,.61,.36,1);
      z-index: 200;
      display: flex;
      flex-direction: column;
    }
    .mobile-drawer.open { transform: translateX(0); }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.2rem;
      border-bottom: 1px solid #f0ece4;
    }
    .drawer-close {
      background: transparent;
      border: 0;
      font-size: 1.4rem;
      color: var(--primary-color, #8B6F47);
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      transition: background .2s ease;
    }
    .drawer-close:hover { background: #f7f3ec; }

    .drawer-nav {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
      overflow-y: auto;
      flex: 1;
    }
    .drawer-link {
      display: block;
      padding: 0.95rem 1.4rem;
      color: var(--primary-color, #8B6F47);
      text-decoration: none;
      font-size: 1.02rem;
      letter-spacing: .3px;
      cursor: pointer;
      border-bottom: 1px solid #f6f2ea;
      transition: background .2s ease, color .2s ease;
    }
    .drawer-link:hover { background: #faf6ef; }
    .drawer-link-highlight { color: var(--secondary-color, #C9A96E); font-weight: 600; }

    .drawer-footer {
      padding: 1.2rem 1.4rem 1.6rem;
      border-top: 1px solid #f0ece4;
    }
    .drawer-cta { display: block; text-align: center; }
    .drawer-contact {
      margin: 1rem 0 0;
      font-size: 0.9rem;
      line-height: 1.7;
      color: #6f655a;
    }
    .drawer-contact a {
      color: inherit;
      text-decoration: none;
    }
    .drawer-contact a:hover { color: var(--secondary-color, #C9A96E); }

    /* Tablet: zmniejsz gap i rozmiary */
    @media (max-width: 1100px) {
      .nav { gap: 1.1rem; }
      .nav-link { font-size: 0.88rem; }
      .logo h1 { font-size: 2.2rem; }
      .logo p { font-size: 0.72rem; letter-spacing: 6px; text-indent: 6px; }
      .booking-btn { padding: 0.6rem 1.1rem; font-size: 0.82rem; }
    }

    /* Mobile: ukryj desktopową nawigację, pokaż hamburger */
    @media (max-width: 860px) {
      .header { padding: 0.9rem 0; }
      .nav-desktop { display: none; }
      .nav-toggle { display: inline-block; }
      .header-actions .booking-btn { display: none; } /* CTA przeniesione do drawera */
      .logo h1 { font-size: 2rem; }
      .logo p { font-size: 0.68rem; letter-spacing: 5px; text-indent: 5px; }
    }
  `]
})
export class HeaderComponent {
  menuOpen = false;

  constructor(
    private translationService: TranslationService,
    private router: Router,
  ) {
    // Zamknij drawer po nawigacji
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) this.closeMenu();
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.applyBodyLock();
  }

  closeMenu(): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.applyBodyLock();
  }

  private applyBodyLock(): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.closeMenu(); }

  scrollTo(sectionId: string): void {
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

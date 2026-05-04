import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { PageSection } from '../../models';

@Component({
  selector: 'app-headary-spa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="kobido-page" *ngIf="sections.length; else loading">
      <ng-container *ngFor="let section of sections">
        <ng-container [ngSwitch]="section.type">

          <!-- HERO -->
          <header *ngSwitchCase="'hero'" class="kobido-hero">
            <div class="hero-image">
              <img [src]="content.resolveImage(section.image_url || 'assets/images/_MG_0453.jpg')"
                   [alt]="content.pickString(section.title, lang)">
            </div>
            <div class="hero-overlay">
              <div class="container">
                <p class="eyebrow" *ngIf="content.pickString(section.subtitle, lang)">
                  {{ content.pickString(section.subtitle, lang) }}
                </p>
                <h1>{{ content.pickString(section.title, lang) }}</h1>
                <p class="tagline" *ngIf="content.pickString(section.body, lang)">
                  {{ content.pickString(section.body, lang) }}
                </p>
                <a *ngIf="section.meta?.['cta_url']"
                   [href]="section.meta?.['cta_url']" target="_blank" class="cta-btn">
                  {{ heroCtaLabel(section) }}
                </a>
              </div>
            </div>
          </header>

          <!-- Non-hero sections -->
          <div *ngSwitchDefault class="container content-wrapper">

            <!-- rich-text (FAQ-style answer with bullets / **headings** / paragraphs) -->
            <section *ngIf="section.type === 'rich-text'"
                     class="kobido-section"
                     [class.highlight-section]="section.meta?.['variant'] === 'highlight'"
                     [class.list-prep]="section.meta?.['variant'] === 'prep'">
              <h2>{{ content.pickString(section.title, lang) }}</h2>
              <div class="prose"
                   [innerHTML]="content.md(toMarkdown(content.pickString(section.body, lang)))"></div>
            </section>

            <!-- cta -->
            <section *ngIf="section.type === 'cta'" class="kobido-cta">
              <h2>{{ content.pickString(section.title, lang) }}</h2>
              <p *ngIf="content.pickString(section.body, lang)">
                {{ content.pickString(section.body, lang) }}
              </p>
              <div class="cta-buttons">
                <a *ngIf="section.meta?.['primary_url']"
                   [href]="section.meta?.['primary_url']" target="_blank"
                   class="cta-btn primary">
                  {{ ctaLabel(section, 'primary') }}
                </a>
                <a *ngIf="section.meta?.['secondary_url']"
                   (click)="onSecondaryCtaClick(section.meta?.['secondary_url'])"
                   class="cta-btn secondary">
                  {{ ctaLabel(section, 'secondary') }}
                </a>
              </div>
            </section>

          </div>
        </ng-container>
      </ng-container>

      <!-- Certificates (kept hardcoded — managed via /admin/gallery if needed) -->
      <div class="container content-wrapper">
        <section class="kobido-section certificates-section">
          <h2>{{ translate('about.certificates') }}</h2>
          <div class="cert-grid">
            <button type="button" class="cert-item" (click)="openCertificate('assets/images/certyfikat1.jpg')">
              <img src="assets/images/certyfikat1.jpg" alt="Certyfikat 1" loading="lazy">
            </button>
            <button type="button" class="cert-item" (click)="openCertificate('assets/images/certyfikat2.jpg')">
              <img src="assets/images/certyfikat2.jpg" alt="Certyfikat 2" loading="lazy">
            </button>
          </div>
        </section>
      </div>
    </article>

    <!-- Certificate lightbox -->
    <div class="cert-lightbox" *ngIf="certificateImage" (click)="closeCertificate()">
      <button type="button" class="cert-lightbox-close" aria-label="Close">×</button>
      <img [src]="certificateImage" alt="Certyfikat" (click)="$event.stopPropagation()">
    </div>

    <ng-template #loading>
      <div class="kobido-loading">{{ translate('common.loading') }}</div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .kobido-page { background: #faf8f5; min-height: 100vh; }
    .kobido-loading { text-align: center; padding: 6rem 1rem; color: #8B6F47; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 20px; }
    .content-wrapper { padding: 2rem 20px 0; }
    .content-wrapper:first-of-type { padding-top: 4rem; }
    .content-wrapper:last-of-type { padding-bottom: 4rem; }

    /* HERO (same as Kobido) */
    .kobido-hero {
      position: relative; height: 60vh; min-height: 420px; overflow: hidden;
      background: linear-gradient(135deg, #8B6F47 0%, #C9A96E 100%);
    }
    .hero-image { position: absolute; inset: 0; }
    .hero-image img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
    .hero-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center;
      color: #fff;
      background: linear-gradient(180deg, rgba(60, 44, 28, 0.25), rgba(60, 44, 28, 0.55));
    }
    .hero-overlay .eyebrow { letter-spacing: 3px; text-transform: uppercase; font-size: 0.85rem; opacity: 0.9; margin: 0 0 0.5rem; color: #E8DCC8; }
    .hero-overlay h1 { font-family: var(--font-secondary, 'Playfair Display', serif); font-size: 4.5rem; letter-spacing: 8px; margin: 0 0 1rem; font-weight: 300; }
    .hero-overlay .tagline { font-size: 1.2rem; max-width: 640px; margin: 0 0 2rem; line-height: 1.5; }

    /* CTA buttons */
    .cta-btn {
      display: inline-block; padding: 0.9rem 2.2rem;
      background: var(--secondary-color, #C9A96E);
      color: #fff;
      text-decoration: none; border-radius: 30px;
      font-weight: 600; letter-spacing: 1px; cursor: pointer;
      transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(139, 111, 71, 0.25); background: #b8965d; }

    /* Sections (same visual language as Kobido) */
    .kobido-section {
      background: #fff; border-radius: 8px;
      padding: 2.5rem; margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(139, 111, 71, 0.08);
      font-family: var(--font-primary, 'Nunito', sans-serif);
    }
    .kobido-section h2 {
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      font-size: 1.9rem; margin: 0 0 1.2rem;
      padding-bottom: 0.8rem;
      border-bottom: 2px solid var(--secondary-color, #C9A96E);
      font-weight: 400;
    }

    /* Prose content, matches Kobido typography */
    .prose p { font-family: var(--font-primary, 'Nunito', sans-serif); line-height: 1.75; color: #555; font-size: 0.95rem; margin: 0 0 0.9rem; font-weight: 400; }
    ::ng-deep .prose p { font-family: var(--font-primary, 'Nunito', sans-serif); line-height: 1.75; color: #555; font-size: 0.95rem; margin: 0 0 0.9rem; font-weight: 400; }
    ::ng-deep .prose p:last-child { margin-bottom: 0; }
    ::ng-deep .prose strong {
      color: var(--primary-color, #8B6F47);
      font-weight: 600;
    }
    ::ng-deep .prose em { color: #666; }

    /* Lists: dash marker like Kobido */
    ::ng-deep .prose ul {
      list-style: none; padding: 0;
      margin: 0.25rem 0 1rem;
      display: flex; flex-direction: column; gap: 0.35rem;
      font-family: var(--font-primary, 'Nunito', sans-serif);
    }
    ::ng-deep .prose ul li {
      position: relative;
      padding: 0.35rem 0 0.35rem 1.5rem;
      line-height: 1.65; color: #555;
      font-size: 0.95rem; margin: 0;
    }
    ::ng-deep .prose ul li::before {
      content: '✓';
      position: absolute;
      left: 0; top: 0.35rem;
      color: var(--secondary-color, #C9A96E);
      font-weight: 700; font-size: 0.9rem; line-height: 1.65;
    }

    /* Highlight variant (softer background) */
    .highlight-section {
      background: linear-gradient(135deg, #fff 0%, #faf7f2 100%);
      border-left: 4px solid var(--secondary-color, #C9A96E);
    }

    /* CTA section */
    .kobido-cta {
      text-align: center; padding: 3.5rem 2rem;
      background: linear-gradient(135deg, #f3ede3, #e8dcc8);
      border-radius: 8px; margin-top: 1rem;
    }
    .kobido-cta h2 { font-family: var(--font-secondary, 'Playfair Display', serif); font-size: 2rem; color: var(--primary-color, #8B6F47); margin: 0 0 0.8rem; font-weight: 400; }
    .kobido-cta p { margin: 0 0 1.8rem; color: #6b553a; font-size: 1.1rem; line-height: 1.6; }
    .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .cta-btn.primary { background: var(--secondary-color, #C9A96E); color: #fff; }
    .cta-btn.secondary {
      background: transparent;
      color: var(--primary-color, #8B6F47);
      border: 2px solid var(--primary-color, #8B6F47);
    }
    .cta-btn.secondary:hover { background: var(--primary-color, #8B6F47); color: #fff; }

    @media (max-width: 768px) {
      .hero-overlay h1 { font-size: 3rem; letter-spacing: 5px; }
      .hero-overlay .tagline { font-size: 1rem; }
      .kobido-section { padding: 1.5rem; }
      .kobido-section h2 { font-size: 1.5rem; }
      .content-wrapper { padding: 1rem 16px; }
    }

    /* Certificates */
    .certificates-section .cert-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1rem; }
    .cert-item { background: transparent; border: none; padding: 0; cursor: zoom-in; display: block; transition: transform .25s ease; }
    .cert-item:hover { transform: translateY(-3px); }
    .cert-item img { display: block; width: 100%; height: auto; max-height: 420px; object-fit: contain; border-radius: 4px; }
    @media (max-width: 700px) { .certificates-section .cert-grid { grid-template-columns: 1fr; } }

    /* Certificate lightbox */
    .cert-lightbox {
      position: fixed; inset: 0;
      background: rgba(20, 14, 8, 0.85);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; padding: 2rem;
      cursor: zoom-out;
      animation: certFade .2s ease;
    }
    .cert-lightbox img {
      max-width: 95vw; max-height: 90vh;
      border-radius: 4px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      cursor: default; background: #fff;
    }
    .cert-lightbox-close {
      position: absolute; top: 1.25rem; right: 1.5rem;
      width: 2.5rem; height: 2.5rem;
      border-radius: 50%; border: none;
      background: rgba(255,255,255,0.15);
      color: #fff; font-size: 1.75rem; line-height: 1;
      cursor: pointer; transition: background .2s ease;
    }
    .cert-lightbox-close:hover { background: rgba(255,255,255,0.3); }
    @keyframes certFade { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class HeadarySpaComponent implements OnInit, OnDestroy {
  sections: PageSection[] = [];
  lang = 'pl';
  certificateImage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    public content: ContentService,
    private translation: TranslationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const anyT: any = this.translation;
    this.lang = (anyT.getLanguage && anyT.getLanguage()) || 'pl';
    this.translation.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => (this.lang = l));

    this.api.getPageSections('headary-spa').subscribe({
      next: (data) => (this.sections = (data || []).sort((a, b) => a.order - b.order)),
      error: (err) => console.error('Failed to load Headary SPA sections:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Convert seed/admin content (lines starting with `• `) into proper markdown
   * (`- `) so `marked` renders <ul><li>. Other markdown (e.g. **bold:**) is
   * preserved unchanged.
   */
  toMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => {
        const trimmed = line.replace(/^\s+/, '');
        if (trimmed.startsWith('• ')) return '- ' + trimmed.substring(2);
        return line;
      })
      .join('\n');
  }

  heroCtaLabel(s: PageSection): string {
    const m: any = s.meta || {};
    return m[`cta_label_${this.lang}`] || m['cta_label_pl'] || m['cta_label_en'] || this.translate('header.bookAppointment');
  }

  ctaLabel(s: PageSection, which: 'primary' | 'secondary'): string {
    const m: any = s.meta || {};
    return m[`${which}_label_${this.lang}`] || m[`${which}_label_pl`] || m[`${which}_label_en`] || '';
  }

  /** Secondary CTA may be an internal hash anchor (#contact), an internal route, or external URL. */
  onSecondaryCtaClick(url: string | undefined): void {
    if (!url) return;
    if (url.startsWith('/#') || url.startsWith('#')) {
      // Scroll to contact section on home page
      const id = url.replace(/^\/?#/, '');
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      });
      return;
    }
    if (url.startsWith('/')) {
      this.router.navigateByUrl(url);
      return;
    }
    window.open(url, '_blank');
  }

  openCertificate(src: string): void { this.certificateImage = src; }
  closeCertificate(): void { this.certificateImage = null; }

  translate(key: string): string {
    return this.translation.translate(key);
  }
}


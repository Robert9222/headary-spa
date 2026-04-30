import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

interface FaqSection {
  id: number;
  question: string;
  body: SafeHtml;
  variant: 'default' | 'warning' | 'prep' | 'highlight';
  note?: string;
}

@Component({
  selector: 'app-headary-spa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="kobido-page">

      <!-- HERO -->
      <header class="kobido-hero">
        <div class="hero-image">
          <img src="assets/images/_MG_0453.jpg"
               alt="Headary SPA">
        </div>
        <div class="hero-overlay">
          <div class="container">
            <p class="eyebrow">{{ translate('faq.hero.eyebrow') }}</p>
            <h1>Head SPA</h1>
            <p class="tagline">{{ translate('faq.subtitle') }}</p>
            <a href="https://timma.no/salong/headary-spa" target="_blank" class="cta-btn">
              {{ translate('header.bookAppointment') }}
            </a>
          </div>
        </div>
      </header>

      <div class="container content-wrapper">


        <!-- FAQ sections, each rendered as a descriptive Kobido-style card -->
        <ng-container *ngFor="let f of faqs">
          <section class="kobido-section"
                   [class.warning-section]="f.variant === 'warning'"
                   [class.list-prep]="f.variant === 'prep'"
                   [class.highlight-section]="f.variant === 'highlight'">
            <h2>{{ f.question }}</h2>
            <div class="prose" [innerHTML]="f.body"></div>
            <p class="contact-note" *ngIf="f.note">{{ f.note }}</p>
          </section>
        </ng-container>

        <!-- Certificates -->
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

        <!-- CTA -->
        <section class="kobido-cta">
          <h2>{{ translate('faq.ctaTitle') }}</h2>
          <p>{{ translate('faq.ctaBody') }}</p>
          <div class="cta-buttons">
            <a href="https://timma.no/salong/headary-spa" target="_blank" class="cta-btn primary">
              {{ translate('faq.ctaPrimary') }}
            </a>
            <a (click)="goToContact()" class="cta-btn secondary">
              {{ translate('faq.ctaSecondary') }}
            </a>
          </div>
        </section>
      </div>
    </article>

    <!-- Certificate lightbox -->
    <div class="cert-lightbox" *ngIf="certificateImage" (click)="closeCertificate()">
      <button type="button" class="cert-lightbox-close" aria-label="Close">×</button>
      <img [src]="certificateImage" alt="Certyfikat" (click)="$event.stopPropagation()">
    </div>
  `,
  styles: [`
    :host { display: block; }
    .kobido-page { background: #faf8f5; min-height: 100vh; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 20px; }
    .content-wrapper { padding: 4rem 20px; }

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

    .intro-section { background: linear-gradient(135deg, #fff, #faf7f2); }
    .intro-section .intro-lead {
      font-size: 1.05rem; color: #555;
      line-height: 1.75; margin: 0;
    }

    /* Prose content, matches Kobido typography */
    .prose p {
      font-family: var(--font-primary, 'Nunito', sans-serif);
      line-height: 1.75; color: #555;
      font-size: 0.95rem; margin: 0 0 0.9rem; font-weight: 400;
    }
    ::ng-deep .prose p {
      font-family: var(--font-primary, 'Nunito', sans-serif);
      line-height: 1.75; color: #555;
      font-size: 0.95rem; margin: 0 0 0.9rem; font-weight: 400;
    }
    ::ng-deep .prose p:last-child { margin-bottom: 0; }

    /* Section sub-headings inside prose */
    ::ng-deep .prose .faq-heading {
      display: block;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      font-size: 1.15rem;
      font-weight: 500;
      margin: 1.75rem 0 0.8rem;
      letter-spacing: 0.3px;
    }
    ::ng-deep .prose > .faq-heading:first-child { margin-top: 0; }

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
      left: 0;
      top: 0.35rem;
      color: var(--secondary-color, #C9A96E);
      font-weight: 700;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    /* Warning section (for contraindications) */
    .warning-section { border-top: 4px solid var(--secondary-color, #C9A96E); }
    .warning-section h2 {
      color: var(--primary-color, #8B6F47);
      border-bottom-color: rgba(201, 169, 110, 0.45);
    }
    .warning-section ::ng-deep .prose .faq-heading {
      color: #8B6F47;
      background: #fbf5ea;
      padding: 0.55rem 0.95rem;
      border-left: 4px solid var(--secondary-color, #C9A96E);
      border-radius: 4px;
      font-size: 1.05rem;
      margin: 1.75rem 0 0.9rem;
    }
    .warning-section ::ng-deep .prose ul li::before {
      color: #b8965d;
      opacity: 0.95;
    }
    .contact-note {
      margin-top: 1.5rem;
      padding: 1rem 1.2rem;
      background: #f7efe4;
      border-left: 4px solid var(--secondary-color, #C9A96E);
      border-radius: 4px; font-style: italic; color: #6b553a;
      line-height: 1.65;
    }

    /* Prep variant — keep same dash marker as default for visual consistency */
    .list-prep ::ng-deep .prose ul li { padding-left: 1.25rem; }

    /* Highlight variant (softer background) */
    .highlight-section {
      background: linear-gradient(135deg, #fff 0%, #faf7f2 100%);
      border-left: 4px solid var(--secondary-color, #C9A96E);
    }

    /* CTA section (same as Kobido) */
    .kobido-cta {
      text-align: center; padding: 3.5rem 2rem;
      background: linear-gradient(135deg, #f3ede3, #e8dcc8);
      border-radius: 8px; margin-top: 1rem;
    }
    .kobido-cta h2 {
      font-family: var(--font-secondary, 'Playfair Display', serif);
      font-size: 2rem; color: var(--primary-color, #8B6F47);
      margin: 0 0 0.8rem; font-weight: 400;
    }
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
      .content-wrapper { padding: 2rem 16px 3rem; }
    }

    /* Certificates */
    .certificates-section .cert-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .cert-item {
      background: transparent;
      border: none;
      padding: 0;
      cursor: zoom-in;
      display: block;
      transition: transform .25s ease;
    }
    .cert-item:hover { transform: translateY(-3px); }
    .cert-item img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: contain;
      border-radius: 4px;
    }
    @media (max-width: 700px) {
      .certificates-section .cert-grid { grid-template-columns: 1fr; }
    }

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
      cursor: default;
      background: #fff;
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
export class HeadarySpaComponent implements OnInit {
  faqs: FaqSection[] = [];
  certificateImage: string | null = null;

  constructor(
    private translation: TranslationService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildFaqs();
    this.translation.currentLanguage$.subscribe(() => this.buildFaqs());
  }

  translate(key: string): string {
    return this.translation.translate(key);
  }

  goToContact(): void {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });
  }

  openCertificate(src: string): void { this.certificateImage = src; }
  closeCertificate(): void { this.certificateImage = null; }

  private buildFaqs(): void {
    const variants: Array<FaqSection['variant']> =
      ['default', 'highlight', 'default', 'warning', 'prep'];

    this.faqs = [1, 2, 3, 4, 5].map((i, idx) => {
      const { html, trailingNote } = this.formatAnswer(
        this.translate('faq.a' + i),
        variants[idx] === 'warning'
      );
      return {
        id: i,
        question: this.translate('faq.q' + i),
        body: this.sanitizer.bypassSecurityTrustHtml(html),
        variant: variants[idx],
        note: trailingNote,
      };
    });
  }

  private formatAnswer(text: string, extractTrailingNote: boolean):
      { html: string; trailingNote?: string } {
    if (!text) return { html: '' };
    const lines = text.replace(/\r\n/g, '\n').split('\n');

    const html: string[] = [];
    let inList = false;
    let paragraph: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        html.push('<p>' + paragraph.join(' ') + '</p>');
        paragraph = [];
      }
    };
    const closeList = () => {
      if (inList) { html.push('</ul>'); inList = false; }
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushParagraph(); closeList(); continue; }
      if (line.startsWith('• ')) {
        flushParagraph();
        if (!inList) { html.push('<ul>'); inList = true; }
        html.push('<li>' + this.escape(line.substring(2)) + '</li>');
      } else if (/:$/.test(line) && !line.startsWith('•')) {
        flushParagraph();
        closeList();
        html.push('<span class="faq-heading">' + this.escape(line) + '</span>');
      } else {
        closeList();
        paragraph.push(this.escape(line));
      }
    }
    flushParagraph();
    closeList();

    let trailingNote: string | undefined;
    if (extractTrailingNote && html.length) {
      const last = html[html.length - 1];
      const m = /^<p>([\s\S]*)<\/p>$/.exec(last);
      if (m) { trailingNote = this.decode(m[1]); html.pop(); }
    }
    return { html: html.join(''), trailingNote };
  }

  private escape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  private decode(s: string): string {
    return s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
}


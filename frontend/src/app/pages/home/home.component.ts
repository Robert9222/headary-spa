import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { ContentService } from '@services/content.service';
import { TranslationService } from '@services/translation.service';
import { GalleryItem, Service, Review, PageSection } from '@app/models';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home">
      <!-- Hero Slider Section -->
      <section class="hero" id="hero">
        <div class="hero-slider">
          <div class="hero-slide" *ngFor="let slide of heroSlides; let i = index"
               [class.active]="i === currentSlide"
               [class.prev]="i === prevSlide">
            <img [src]="slide" alt="Headary SPA">
          </div>
        </div>
        <div class="hero-overlay">
          <div class="hero-content">
            <h1>{{ cmsTitle('hero', 'hero.welcome') }}</h1>
            <p>{{ cmsBody('hero', 'hero.subtitle') }}</p>
            <a [href]="cmsMetaString('hero', 'cta_url', 'https://timma.no/salon/headary-spa')"
               target="_blank" class="cta-btn">{{ cmsCtaLabel('hero', 'hero.cta') }}</a>
          </div>
        </div>
        <div class="slider-dots">
          <span *ngFor="let slide of heroSlides; let i = index"
                class="dot" [class.active]="i === currentSlide"
                (click)="goToSlide(i)"></span>
        </div>
      </section>

      <!-- Welcome Section -->
      <section class="welcome-section animate-on-scroll" id="about">
        <div class="container">
          <h2 class="welcome-title">{{ cmsTitle('welcome', 'welcome.title') }}</h2>
          <div class="welcome-divider"></div>
          <p class="welcome-text">{{ cmsBody('welcome', 'welcome.description') }}</p>
        </div>
      </section>

      <!-- About Me Section -->
      <section class="about-section animate-on-scroll" id="about-me">
        <div class="container about-grid">
          <div class="about-image">
            <img [src]="cmsImage('about', 'assets/images/me.jpg')" alt="Eliza - Headary SPA">
          </div>
          <div class="about-content">
            <h2 class="section-title">{{ cmsTitle('about', 'about.title') }}</h2>
            <ng-container *ngIf="cmsHasBody('about'); else aboutFallback">
              <div class="about-prose" [innerHTML]="content.md(cmsBody('about'))"></div>
            </ng-container>
            <ng-template #aboutFallback>
              <p>{{ translate('about.p1') }}</p>
              <p>{{ translate('about.p2') }}</p>
              <p>{{ translate('about.p3') }}</p>
              <p class="about-highlight">{{ translate('about.p4') }}</p>
            </ng-template>
          </div>
        </div>
      </section>



      <!-- Services Section - Grouped by Category -->
      <section class="services-section animate-on-scroll" id="services">
        <div class="container">
          <h2 class="section-title">{{ cmsTitle('services-intro', 'services.title') }}</h2>

          <div *ngFor="let category of serviceCategories" class="category-block">
            <h3 class="category-title">{{ translateCategory(category) }}</h3>
            <div class="services-list">
              <div *ngFor="let service of getServicesByCategory(category)" class="service-card">
                <div class="service-card-content">
                  <div class="service-header">
                    <h4 class="service-name">{{ translateServiceName(service) }}</h4>
                    <span class="service-price">{{ service.price }}€</span>
                  </div>
                  <p class="service-description">{{ translateServiceDescription(service) }}</p>
                  <a href="https://timma.no/salon/headary-spa" target="_blank" class="book-link">
                    {{ translate('hero.cta') }} →
                  </a>
                </div>
                <div class="service-image" *ngIf="getServiceImage(service)">
                  <img [src]="getServiceImage(service)" [alt]="translateServiceName(service)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section animate-on-scroll" id="how-it-works">
        <div class="container">
          <h2 class="section-title">{{ cmsTitle('how-it-works', 'howItWorks.title') }}</h2>
          <div class="steps-grid" *ngIf="cmsSteps().length; else stepsFallback">
            <div class="step-card" *ngFor="let step of cmsSteps(); let i = index">
              <div class="step-icon">{{ step.icon }}</div>
              <div class="step-number">{{ i + 1 }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
          <ng-template #stepsFallback>
            <div class="steps-grid">
              <div class="step-card">
                <div class="step-icon">📅</div>
                <div class="step-number">1</div>
                <h3 class="step-title">{{ translate('howItWorks.step1.title') }}</h3>
                <p class="step-desc">{{ translate('howItWorks.step1.desc') }}</p>
              </div>
              <div class="step-card">
                <div class="step-icon">🧴</div>
                <div class="step-number">2</div>
                <h3 class="step-title">{{ translate('howItWorks.step2.title') }}</h3>
                <p class="step-desc">{{ translate('howItWorks.step2.desc') }}</p>
              </div>
              <div class="step-card">
                <div class="step-icon">💆</div>
                <div class="step-number">3</div>
                <h3 class="step-title">{{ translate('howItWorks.step3.title') }}</h3>
                <p class="step-desc">{{ translate('howItWorks.step3.desc') }}</p>
              </div>
              <div class="step-card">
                <div class="step-icon">✨</div>
                <div class="step-number">4</div>
                <h3 class="step-title">{{ translate('howItWorks.step4.title') }}</h3>
                <p class="step-desc">{{ translate('howItWorks.step4.desc') }}</p>
              </div>
            </div>
          </ng-template>
        </div>
      </section>

      <!-- Gallery Preview -->
      <section class="gallery-preview animate-on-scroll" id="gallery" *ngIf="galleryItems.length > 0">
        <div class="container">
          <h2 class="section-title">{{ translate('gallery.title') }}</h2>
          <div class="gallery-grid">
            <div *ngFor="let item of galleryItems | slice:0:6" class="gallery-item">
              <img [src]="item.image_url" [alt]="item.title">
            </div>
          </div>
        </div>
      </section>

      <!-- Voucher Section -->
      <section class="voucher-section animate-on-scroll" id="voucher">
        <div class="container voucher-grid">
          <div class="voucher-image">
            <img [src]="cmsImage('voucher', 'assets/images/_MG_0183.jpg')" alt="Voucher prezentowy">
          </div>
          <div class="voucher-content">
            <h2 class="section-title">{{ cmsTitle('voucher', 'voucher.title') }}</h2>
            <p class="voucher-intro">{{ cmsSubtitle('voucher', 'voucher.intro') }}</p>
            <p class="voucher-description">{{ cmsBody('voucher', 'voucher.description') }}</p>
            <button type="button" class="voucher-btn" (click)="openVoucherModal()">{{ cmsCtaLabel('voucher', 'voucher.cta') }} →</button>

            <div class="voucher-terms" [class.open]="termsOpen">
              <button type="button" class="voucher-terms-toggle" (click)="termsOpen = !termsOpen" [attr.aria-expanded]="termsOpen">
                <span>{{ cmsTitle('voucher-terms', 'voucher.termsTitle') }}</span>
                <span class="voucher-terms-icon">{{ termsOpen ? '−' : '+' }}</span>
              </button>
              <div class="voucher-terms-body faq-answer-body" [innerHTML]="formatFaqAnswer(cmsBody('voucher-terms', 'voucher.terms'))"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section animate-on-scroll" id="reviews">
        <div class="container">
          <h2 class="section-title">{{ cmsTitle('reviews-intro', 'reviews.title') }}</h2>
          <div class="reviews-grid">
            <div *ngFor="let review of (reviewsExpanded ? reviews : reviews.slice(0, 3))" class="review-card">
              <div class="review-stars">
                <span *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= review.rating">★</span>
              </div>
              <p class="review-text" [class.clamped]="!isReviewExpanded(review)">"{{ getReviewContent(review) }}"</p>
              <button *ngIf="isReviewLong(review)" type="button" class="review-toggle" (click)="toggleReview(review)">
                {{ isReviewExpanded(review) ? translate('reviews.less') : translate('reviews.readMore') }}
              </button>
              <div class="review-author">
                <span class="author-name">{{ review.client_name }}</span>
                <span class="review-date">{{ review.created_at | date: 'MMM d, yyyy' }}</span>
              </div>
            </div>
          </div>
          <div class="reviews-more" *ngIf="reviews.length > 3">
            <button type="button" class="reviews-more-btn" (click)="reviewsExpanded = !reviewsExpanded" [attr.aria-expanded]="reviewsExpanded">
              <span>{{ reviewsExpanded ? translate('reviews.less') : translate('reviews.more') }}</span>
              <span class="reviews-more-icon">{{ reviewsExpanded ? '−' : '+' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- FAQ moved to dedicated /headary-spa page -->

      <!-- Footer -->
      <footer class="footer" id="contact">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3>Headary</h3>
              <p class="footer-spa">SPA</p>
            </div>
            <div class="footer-links">
              <h4>Quick Links</h4>
              <a href="https://timma.no/salon/headary-spa" target="_blank" class="footer-social-link">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm0 2-7 4.5L5 6h14zm0 12H5a1 1 0 0 1-1-1V8.38l7.53 4.87a.5.5 0 0 0 .94 0L20 8.38V17a1 1 0 0 1-1 1z"/></svg>
                {{ translate('hero.cta') }}
              </a>
              <a href="https://www.instagram.com/headary_spa/" target="_blank" class="footer-social-link">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                Instagram
              </a>
              <a href="https://www.facebook.com/profile.php?id=61580059850043" target="_blank" class="footer-social-link">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a href="https://www.tiktok.com/@headary_spa" target="_blank" class="footer-social-link">
                <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.07A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
                TikTok
              </a>
            </div>
            <div class="footer-contact">
              <h4>{{ translate('nav.contact') }}</h4>
              <p>📍 Nortamonkatu 26, Rauma, Finland</p>
              <p>📞 <a href="tel:+358411441220" class="footer-contact-link">+358 41 144 1220</a></p>
              <p>✉️ <a href="mailto:headaryspa@gmail.com" class="footer-contact-link">headaryspa&#64;gmail.com</a></p>
            </div>
          </div>
          <div class="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1928.5!2d21.5!3d61.1333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x468b9a0d9e8b0001%3A0x0!2sNortamonkatu+26%2C+26100+Rauma%2C+Finland!5e0!3m2!1sfi!2sfi!4v1"
              width="100%" height="250" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div class="footer-disclaimer">
            <p>
              <svg class="disclaimer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <!-- Lotus flower — symbol of calm, purity & Japanese head spa tradition -->
                <g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                  <!-- center petal -->
                  <path d="M12 4c1.6 2.5 1.6 6.5 0 10-1.6-3.5-1.6-7.5 0-10z"/>
                  <!-- side petals -->
                  <path d="M5 9c2.5-.3 5.3 1.3 7 5-3.6.3-6.4-1.6-7-5z"/>
                  <path d="M19 9c-2.5-.3-5.3 1.3-7 5 3.6.3 6.4-1.6 7-5z"/>
                  <!-- water base -->
                  <path d="M4 17c2.5 1.5 5 2 8 2s5.5-.5 8-2" opacity="0.7"/>
                </g>
              </svg>
              {{ cmsBody('footer-disclaimer', 'footer.disclaimer') }}
            </p>
          </div>
          <div class="footer-bottom">
            <p>© 2026 Headary SPA. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <!-- Floating CTA (mobile only) -->
      <a *ngIf="showFloatingCta" href="https://timma.no/salon/headary-spa" target="_blank" class="floating-cta">
        {{ translate('floatingCta') }}
      </a>

      <!-- Voucher Modal -->
      <div class="voucher-modal-overlay" *ngIf="showVoucherModal" (click)="closeVoucherModal()">
        <div class="voucher-modal" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="closeVoucherModal()">✕</button>

          <div class="voucher-modal-grid">
            <!-- Voucher Preview -->
            <div class="voucher-preview">
              <div class="voucher-card">
                <img src="assets/images/_MG_0183.jpg" alt="Headary SPA" class="voucher-card-bg">
                <div class="voucher-card-overlay">
                  <h3>Headary SPA</h3>
                  <p class="voucher-card-for" *ngIf="voucherData.recipient_name">{{ translate('voucherForm.recipientName') }}: <strong>{{ voucherData.recipient_name }}</strong></p>
                  <p class="voucher-card-treatment" *ngIf="voucherData.voucher_type === 'treatment' && voucherData.treatment">{{ voucherData.treatment }}</p>
                  <p class="voucher-card-treatment voucher-card-amount" *ngIf="voucherData.voucher_type === 'amount' && voucherData.amount">{{ voucherData.amount }}€</p>
                  <p class="voucher-card-msg" *ngIf="voucherData.message">"{{ voucherData.message }}"</p>
                  <p class="voucher-card-from" *ngIf="voucherData.sender_name">— {{ voucherData.sender_name }}</p>
                </div>
              </div>
            </div>

            <!-- Form -->
            <div class="voucher-form">
              <h2>{{ translate('voucher.cta') }}</h2>

              <div *ngIf="voucherSuccess" class="voucher-alert voucher-alert-success">
                {{ translate('voucherForm.success') }}
              </div>
              <div *ngIf="voucherError" class="voucher-alert voucher-alert-error">
                {{ translate('voucherForm.error') }}
              </div>

              <form (ngSubmit)="submitVoucher()" *ngIf="!voucherSuccess">
                <div class="form-group">
                  <input type="text" [(ngModel)]="voucherData.sender_name" name="sender_name"
                         [placeholder]="translate('voucherForm.senderName')" required>
                </div>
                <div class="form-group">
                  <input type="email" [(ngModel)]="voucherData.sender_email" name="sender_email"
                         [placeholder]="translate('voucherForm.senderEmail')" required>
                </div>
                <div class="form-group">
                  <input type="tel" [(ngModel)]="voucherData.sender_phone" name="sender_phone"
                         [placeholder]="translate('voucherForm.senderPhone')" required>
                </div>
                <p class="voucher-form-hint">{{ translate('voucherForm.contactHint') }}</p>
                <div class="form-group">
                  <input type="text" [(ngModel)]="voucherData.recipient_name" name="recipient_name"
                         [placeholder]="translate('voucherForm.recipientName')" required>
                </div>

                <!-- Voucher type toggle -->
                <div class="voucher-type-toggle" role="tablist">
                  <button type="button"
                          class="voucher-type-btn"
                          [class.active]="voucherData.voucher_type === 'treatment'"
                          (click)="setVoucherType('treatment')">
                    {{ translate('voucherForm.typeTreatment') }}
                  </button>
                  <button type="button"
                          class="voucher-type-btn"
                          [class.active]="voucherData.voucher_type === 'amount'"
                          (click)="setVoucherType('amount')">
                    {{ translate('voucherForm.typeAmount') }}
                  </button>
                </div>

                <div class="form-group" *ngIf="voucherData.voucher_type === 'treatment'">
                  <select [(ngModel)]="voucherData.treatment" name="treatment" required>
                    <option value="" disabled>{{ translate('voucherForm.selectTreatment') }}</option>
                    <optgroup *ngFor="let category of serviceCategories" [label]="translateCategory(category)">
                      <option *ngFor="let service of getServicesByCategory(category)"
                              [value]="translateServiceName(service) + ' (' + service.price + '€)'">
                        {{ translateServiceName(service) }} — {{ service.price }}€
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div class="form-group" *ngIf="voucherData.voucher_type === 'amount'">
                  <input type="number" min="10" step="5"
                         [(ngModel)]="voucherData.amount" name="amount"
                         [placeholder]="translate('voucherForm.amountPlaceholder')" required>
                  <div class="voucher-amount-presets">
                    <button type="button" class="preset-chip"
                            *ngFor="let v of [50, 75, 100, 150, 200]"
                            [class.active]="voucherData.amount === v"
                            (click)="voucherData.amount = v">
                      {{ v }}€
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <textarea [(ngModel)]="voucherData.message" name="message" rows="3"
                            [placeholder]="translate('voucherForm.message')"></textarea>
                </div>
                <button type="submit" class="voucher-submit" [disabled]="voucherSending">
                  {{ voucherSending ? translate('voucherForm.sending') : translate('voucherForm.send') }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home {
      width: 100%;
      background: #f9f7f4;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .section-title {
      font-size: 2.2rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      text-align: center;
      margin-bottom: 3rem;
      color: var(--primary-color, #8B6F47);
      font-weight: 400;
    }

    /* Hero Section */
    .hero {
      position: relative;
      height: 70vh;
      min-height: 450px;
      overflow: hidden;
    }

    .hero-slider {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .hero-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.2s ease-in-out;
      z-index: 0;
    }

    .hero-slide.active {
      opacity: 1;
      z-index: 1;
    }

    .hero-slide.prev {
      opacity: 0;
      z-index: 0;
    }

    .hero-slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .slider-dots {
      position: absolute;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 3;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      cursor: pointer;
      transition: background 0.3s, transform 0.3s;
    }

    .dot.active {
      background: white;
      transform: scale(1.3);
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(139, 111, 71, 0.45);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      z-index: 2;
    }

    .hero-content {
      color: white;
      padding: 0 60px;
      max-width: 600px;
    }

    .hero-content h1 {
      font-size: 3.2rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      margin: 0 0 1rem 0;
      font-weight: 300;
      line-height: 1.15;
      color: white;
    }

    .hero-content p {
      font-size: 1.15rem;
      margin-bottom: 2rem;
      line-height: 1.6;
      font-weight: 300;
    }

    .cta-btn {
      background: var(--primary-color, #8B6F47);
      color: white;
      padding: 0.9rem 2.5rem;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      display: inline-block;
      transition: transform 0.3s, background 0.3s;
      font-size: 0.9rem;
    }

    .cta-btn:hover {
      transform: scale(1.05);
      background: var(--secondary-color, #D4AF37);
      color: var(--primary-color, #8B6F47);
    }

    /* Welcome Section */
    .welcome-section {
      padding: 3rem 0;
      background: #f9f7f4;
      text-align: center;
    }

    .welcome-title {
      font-size: 2.4rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      font-weight: 400;
      margin: 0 0 1.5rem 0;
    }

    .welcome-divider {
      width: 80px;
      height: 2px;
      background: var(--secondary-color, #D4AF37);
      margin: 0 auto 2rem;
    }

    .welcome-text {
      max-width: 650px;
      margin: 0 auto;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.8;
      font-weight: 300;
    }

    /* About Section */
    .about-section {
      padding: 3rem 0;
      background: #faf8f5;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 3.5rem;
      align-items: center;
    }

    .about-image img {
      width: 100%;
      border-radius: 12px;
      object-fit: cover;
      max-height: 520px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    }

    .about-content .section-title {
      text-align: left;
      margin-bottom: 1.75rem;
    }

    .about-content p {
      color: #555;
      line-height: 1.8;
      font-size: 1rem;
      margin: 0 0 1rem 0;
    }

    .about-highlight {
      color: var(--primary-color, #8B6F47) !important;
      font-weight: 600;
      font-style: italic;
    }

    /* Prose rendered from CMS markdown body (about section). */
    ::ng-deep .about-prose p {
      color: #555;
      line-height: 1.8;
      font-size: 1rem;
      margin: 0 0 1rem 0;
    }
    ::ng-deep .about-prose p:last-child { margin-bottom: 0; }
    ::ng-deep .about-prose strong {
      color: var(--primary-color, #8B6F47);
      font-weight: 600;
    }


    /* How It Works Section */
    .how-it-works-section {
      padding: 3rem 0;
      background: white;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      text-align: center;
    }

    .step-card {
      padding: 2rem 1.5rem;
      position: relative;
    }

    .step-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--secondary-color, #D4AF37);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .step-title {
      font-size: 1.1rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      margin: 0 0 0.75rem 0;
      font-weight: 500;
    }

    .step-desc {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
    }

    /* Services Section */
    .services-section {
      padding: 3rem 0;
      background: white;
    }

    .category-block {
      margin-bottom: 3rem;
    }

    .category-title {
      font-size: 1.6rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--accent-color, #E8DCC8);
      font-weight: 400;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .service-card {
      background: #faf8f5;
      border-radius: 8px;
      padding: 0;
      border-left: 4px solid var(--secondary-color, #D4AF37);
      transition: transform 0.3s, box-shadow 0.3s;
      display: flex;
      overflow: hidden;
    }

    .service-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .service-card-content {
      flex: 1;
      padding: 2rem;
    }

    .service-image {
      width: 200px;
      min-height: 100%;
      flex-shrink: 0;
    }

    .service-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .service-name {
      font-size: 1.3rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      margin: 0;
      font-weight: 500;
    }

    .service-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--secondary-color, #D4AF37);
      white-space: nowrap;
    }

    .service-description {
      color: #555;
      line-height: 1.7;
      font-size: 0.95rem;
      margin: 0 0 1rem 0;
    }

    .book-link {
      color: var(--primary-color, #8B6F47);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: color 0.3s;
    }

    .book-link:hover {
      color: var(--secondary-color, #D4AF37);
    }

    /* Gallery Section */
    .gallery-preview {
      padding: 3rem 0;
      background: #f9f7f4;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .gallery-item {
      border-radius: 8px;
      overflow: hidden;
      height: 250px;
      transition: transform 0.3s;
    }

    .gallery-item:hover {
      transform: scale(1.03);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Reviews Section */
    .reviews-section {
      padding: 3rem 0;
      background: white;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .reviews-more {
      display: flex;
      justify-content: center;
      margin-top: 2.5rem;
    }
    .reviews-more-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.75rem;
      background: transparent;
      border: 1px solid rgba(201, 169, 110, 0.45);
      border-radius: 999px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--primary-color, #8B6F47);
      text-transform: uppercase;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }
    .reviews-more-btn:hover {
      background: rgba(201, 169, 110, 0.08);
      border-color: var(--secondary-color, #C9A96E);
      transform: translateY(-1px);
    }
    .reviews-more-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: rgba(201, 169, 110, 0.18);
      color: var(--secondary-color, #C9A96E);
      font-size: 1rem;
      line-height: 1;
    }

    .review-card {
      background: #faf8f5;
      padding: 2rem;
      border-radius: 8px;
      transition: transform 0.3s;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .review-card:hover {
      transform: translateY(-4px);
    }

    .review-stars {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      letter-spacing: 2px;
    }

    .star {
      color: #ddd;
    }

    .star.filled {
      color: var(--secondary-color, #D4AF37);
    }

    .review-text {
      color: #444;
      font-style: italic;
      line-height: 1.7;
      font-size: 0.95rem;
      margin: 0 0 0.75rem 0;
    }
    .review-text.clamped {
      display: -webkit-box;
      -webkit-line-clamp: 5;
      line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .review-toggle {
      align-self: flex-start;
      margin: 0 0 1rem 0;
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      color: var(--secondary-color, #C9A96E);
      text-transform: uppercase;
    }
    .review-toggle:hover { color: var(--primary-color, #8B6F47); }

    .review-author {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .author-name {
      font-weight: 600;
      color: var(--primary-color, #8B6F47);
    }

    .review-date {
      color: #999;
      font-size: 0.85rem;
    }

    /* Voucher Section */
    .voucher-section {
      padding: 3rem 0;
      background: #faf8f5;
    }

    .voucher-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .voucher-image img {
      width: 100%;
      max-height: 400px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .voucher-content .section-title {
      text-align: left;
      margin-bottom: 1.5rem;
    }

    .voucher-intro {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary-color, #8B6F47);
      margin-bottom: 1rem;
    }

    .voucher-description {
      color: #555;
      line-height: 1.8;
      margin-bottom: 2rem;
    }

    .voucher-btn {
      display: inline-block;
      background: var(--secondary-color, #D4AF37);
      color: var(--primary-color, #8B6F47);
      padding: 0.9rem 2rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s, background 0.3s;
    }

    .voucher-btn:hover {
      transform: scale(1.05);
    }
    .voucher-btn:focus { outline: none; }
    .voucher-btn:focus-visible { outline: 2px solid var(--primary-color, #8B6F47); outline-offset: 2px; }

    /* FAQ Section */
    .faq-section {
      padding: 5rem 0;
      background: #f9f7f4;
    }

    .faq-list {
      max-width: 750px;
      margin: 0 auto;
    }

    .faq-item {
      border-bottom: 1px solid var(--accent-color, #E8DCC8);
      overflow: hidden;
    }

    .faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 0;
      cursor: pointer;
      font-size: 1.05rem;
      color: var(--primary-color, #8B6F47);
      font-weight: 500;
      transition: color 0.3s;
      gap: 1rem;
    }

    .faq-question:hover {
      color: var(--secondary-color, #D4AF37);
    }

    .faq-toggle {
      font-size: 1.5rem;
      font-weight: 300;
      flex-shrink: 0;
      width: 28px;
      text-align: center;
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, padding 0.4s ease;
      padding: 0;
    }

    .faq-item.active .faq-answer {
      max-height: 2500px;
      padding: 0 0 1.25rem 0;
    }

    .faq-answer-body {
      color: #555;
      line-height: 1.8;
      font-size: 0.95rem;
    }
    ::ng-deep .faq-answer-body p {
      margin: 0 0 0.8rem;
      color: #555;
      line-height: 1.75;
    }
    ::ng-deep .faq-answer-body p:last-child { margin-bottom: 0; }
    ::ng-deep .faq-answer-body .faq-heading {
      display: block;
      color: var(--primary-color, #8B6F47);
      font-weight: 600;
      margin: 1.1rem 0 0.5rem;
      font-size: 1rem;
      letter-spacing: 0.3px;
    }
    ::ng-deep .faq-answer-body > .faq-heading:first-child { margin-top: 0; }
    ::ng-deep .faq-answer-body ul {
      list-style: none;
      padding: 0;
      margin: 0.25rem 0 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    ::ng-deep .faq-answer-body ul li {
      position: relative;
      padding: 0.35rem 0 0.35rem 1.5rem;
      line-height: 1.65;
      color: #555;
      font-size: 0.95rem;
    }
    ::ng-deep .faq-answer-body ul li::before {
      content: '✓';
      position: absolute;
      left: 0;
      top: 0.35rem;
      color: var(--secondary-color, #C9A96E);
      font-weight: 700;
      font-size: 0.9rem;
      line-height: 1.65;
    }
    ::ng-deep .faq-answer-body ol.faq-ol {
      list-style: none;
      padding: 0;
      margin: 0.25rem 0 1rem;
      counter-reset: faqol;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    ::ng-deep .faq-answer-body ol.faq-ol li {
      counter-increment: faqol;
      position: relative;
      padding: 0.35rem 0 0.35rem 2.25rem;
      line-height: 1.65;
      color: #555;
      font-size: 0.95rem;
    }
    ::ng-deep .faq-answer-body ol.faq-ol li::before {
      content: counter(faqol) ".";
      position: absolute;
      left: 0;
      top: 0.35rem;
      width: 1.75rem;
      color: var(--secondary-color, #C9A96E);
      font-weight: 600;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      font-size: 1rem;
      text-align: left;
    }

    /* Inline voucher form */
    .voucher-form-inline {
      margin-top: 1.75rem;
      padding: 1.5rem 1.5rem 1.25rem;
      background: #fff;
      border: 1px solid rgba(201, 169, 110, 0.25);
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(139, 111, 71, 0.06);
    }
    .voucher-form-title {
      font-family: var(--font-secondary, 'Playfair Display', serif);
      font-size: 1.3rem;
      color: var(--primary-color, #8B6F47);
      margin: 0 0 1rem;
      font-weight: 500;
    }
    .voucher-form-inline .form-group { margin-bottom: 0.85rem; }
    .voucher-form-inline input,
    .voucher-form-inline select,
    .voucher-form-inline textarea {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid rgba(201, 169, 110, 0.35);
      border-radius: 6px;
      background: #faf8f5;
      font-family: inherit;
      font-size: 0.95rem;
      color: #444;
      transition: border-color 0.2s ease, background 0.2s ease;
      box-sizing: border-box;
    }
    .voucher-form-inline input:focus,
    .voucher-form-inline select:focus,
    .voucher-form-inline textarea:focus {
      outline: none;
      border-color: var(--secondary-color, #C9A96E);
      background: #fff;
    }
    .voucher-form-inline textarea { resize: vertical; min-height: 72px; }
    .voucher-submit {
      display: inline-block;
      padding: 0.8rem 2rem;
      background: var(--secondary-color, #C9A96E);
      color: #fff;
      border: none;
      border-radius: 30px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .voucher-submit:hover:not([disabled]) { background: #b8965d; transform: translateY(-1px); }
    .voucher-submit[disabled] { opacity: 0.6; cursor: not-allowed; }
    .voucher-alert {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 0.9rem;
      font-size: 0.92rem;
    }
    .voucher-alert-success {
      background: #eef5ee;
      color: #3f6b3f;
      border: 1px solid rgba(123, 165, 123, 0.35);
    }
    .voucher-alert-error {
      background: #faeaea;
      color: #8c3a3a;
      border: 1px solid rgba(193, 123, 123, 0.35);
    }

    .voucher-terms {
      margin-top: 1.75rem;
      border: 1px solid rgba(201, 169, 110, 0.25);
      border-radius: 10px;
      background: rgba(201, 169, 110, 0.05);
      overflow: hidden;
    }
    .voucher-terms-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 1rem 1.25rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--primary-color, #8B6F47);
      text-align: left;
      text-transform: uppercase;
      transition: background 0.2s ease;
    }
    .voucher-terms-toggle:hover {
      background: rgba(201, 169, 110, 0.08);
    }
    .voucher-terms-icon {
      flex-shrink: 0;
      width: 1.75rem;
      height: 1.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(201, 169, 110, 0.18);
      color: var(--secondary-color, #C9A96E);
      font-size: 1.1rem;
      line-height: 1;
      transition: background 0.2s ease;
    }
    .voucher-terms-body {
      max-height: 0;
      overflow: hidden;
      padding: 0 1.25rem;
      transition: max-height 0.4s ease, padding 0.4s ease;
    }
    .voucher-terms.open .voucher-terms-body {
      max-height: 2500px;
      padding: 0.25rem 1.25rem 1.1rem;
    }

    .faq-answer p {
      color: #555;
      line-height: 1.8;
      font-size: 0.95rem;
      margin: 0;
      white-space: pre-line;    }

    /* Footer */
    .footer {
      background: var(--primary-color, #8B6F47);
      color: white;
      padding: 4rem 0 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-brand h3 {
      font-size: 1.8rem;
      font-family: var(--font-secondary, 'Playfair Display', serif);
      margin: 0;
      color: white;
      font-weight: 400;
      letter-spacing: 2px;
    }

    .footer-spa {
      font-size: 0.8rem;
      letter-spacing: 3px;
      color: rgba(255,255,255,0.7);
      margin: 0 0 1rem 0;
    }

    .footer-tagline {
      color: rgba(255,255,255,0.8);
      line-height: 1.6;
    }

    .footer-links h4,
    .footer-contact h4 {
      color: var(--secondary-color, #D4AF37);
      margin: 0 0 1rem 0;
      font-size: 1rem;
    }

    .footer-links a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      margin-bottom: 0.5rem;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: var(--secondary-color, #D4AF37);
    }

    .footer-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .footer-contact p {
      color: rgba(255,255,255,0.8);
      margin: 0 0 0.5rem 0;
    }
    .footer-contact-link {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: color .2s ease;
    }
    .footer-contact-link:hover { color: var(--secondary-color, #C9A96E); }

    .footer-map {
      margin-bottom: 2rem;
    }

    .footer-disclaimer {
      background: rgba(255,255,255,0.06);
      border-left: 3px solid var(--secondary-color, #C9A96E);
      border-radius: 4px;
      padding: 1rem 1.2rem;
      margin: 0 0 1.5rem;
    }
    .footer-disclaimer p {
      margin: 0;
      color: rgba(255,255,255,0.85);
      font-size: 0.88rem;
      line-height: 1.6;
      font-style: italic;
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }
    .disclaimer-icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--secondary-color, #C9A96E);
      margin-top: 0.15rem;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 2rem;
      text-align: center;
    }

    .footer-bottom p {
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      margin: 0;
    }

    /* Floating CTA */
    .floating-cta {
      display: none;
    }

    /* Scroll Animations */
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.7s ease-out, transform 0.7s ease-out;
    }

    .animate-on-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Voucher Form Button */
    .voucher-btn-form {
      margin-left: 1rem;
      cursor: pointer;
      border: none;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }
    .voucher-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      color: inherit;
      font-size: 1rem;
      line-height: 1;
    }

    /* Voucher Modal */
    .voucher-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .voucher-modal {
      background: white;
      border-radius: 12px;
      max-width: 850px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
      z-index: 1;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.3s;
    }

    .modal-close:hover {
      background: #f0f0f0;
      color: #333;
    }

    .voucher-modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* Voucher Preview Card */
    .voucher-preview {
      padding: 2rem;
      background: #f9f7f4;
      border-radius: 12px 0 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .voucher-card {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      aspect-ratio: 3/4;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .voucher-card-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }

    .voucher-card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(139,111,71,0.95));
      padding: 2rem 1.5rem 1.5rem;
      color: white;
    }

    .voucher-card-overlay h3 {
      font-family: var(--font-secondary, 'Playfair Display', serif);
      font-size: 1.5rem;
      margin: 0 0 0.25rem 0;
      font-weight: 400;
      letter-spacing: 1px;
    }

    .voucher-card-gift {
      font-size: 0.85rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--secondary-color, #D4AF37);
      margin: 0 0 1rem 0;
    }

    .voucher-card-for,
    .voucher-card-treatment {
      font-size: 0.9rem;
      margin: 0 0 0.3rem 0;
      color: rgba(255,255,255,0.9);
    }

    .voucher-card-msg {
      font-style: italic;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
      margin: 0.5rem 0;
    }

    .voucher-card-from {
      font-size: 0.85rem;
      color: var(--secondary-color, #D4AF37);
      margin: 0.5rem 0 0;
    }

    /* Voucher Form */
    .voucher-form {
      padding: 2.5rem 2rem;
    }

    .voucher-form h2 {
      font-family: var(--font-secondary, 'Playfair Display', serif);
      color: var(--primary-color, #8B6F47);
      font-size: 1.5rem;
      font-weight: 400;
      margin: 0 0 1.5rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .voucher-form-hint {
      margin: -0.25rem 0 1rem 0;
      font-size: 0.8rem;
      color: #888;
      line-height: 1.4;
    }

    /* Voucher type toggle (treatment vs amount) */
    .voucher-type-toggle {
      display: flex;
      gap: 0.5rem;
      background: #f5f0e8;
      border-radius: 30px;
      padding: 4px;
      margin: 0.25rem 0 1rem;
    }
    .voucher-type-btn {
      flex: 1;
      padding: 0.55rem 1rem;
      background: transparent;
      border: none;
      border-radius: 24px;
      color: #8B6F47;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s ease, color .2s ease, box-shadow .2s ease;
    }
    .voucher-type-btn:hover { color: #5a4524; }
    .voucher-type-btn.active {
      background: var(--secondary-color, #C9A96E);
      color: #fff;
      box-shadow: 0 2px 8px rgba(139, 111, 71, 0.2);
    }

    /* Amount preset chips */
    .voucher-amount-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.6rem;
    }
    .preset-chip {
      padding: 0.4rem 0.9rem;
      background: #fff;
      border: 1px solid rgba(139, 111, 71, 0.3);
      border-radius: 20px;
      color: #8B6F47;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s ease, color .2s ease, border-color .2s ease;
    }
    .preset-chip:hover { border-color: var(--secondary-color, #C9A96E); }
    .preset-chip.active {
      background: var(--secondary-color, #C9A96E);
      color: #fff;
      border-color: var(--secondary-color, #C9A96E);
    }

    /* Amount on preview card */
    .voucher-card-amount {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.3s;
      box-sizing: border-box;
      background: white;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color, #8B6F47);
    }

    .form-group textarea {
      resize: vertical;
    }

    .voucher-submit {
      width: 100%;
      padding: 0.9rem;
      background: var(--secondary-color, #D4AF37);
      color: var(--primary-color, #8B6F47);
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.3s, opacity 0.3s;
    }

    .voucher-submit:hover {
      transform: scale(1.02);
    }

    .voucher-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .voucher-alert {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .voucher-alert-success {
      background: #d4edda;
      color: #155724;
    }

    .voucher-alert-error {
      background: #f8d7da;
      color: #721c24;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .voucher-grid {
        gap: 2rem;
      }

      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .hero { height: 50vh; min-height: 350px; }
      .hero-content { padding: 0 20px; }
      .hero-content h1 { font-size: 2rem; }
      .hero-content p { font-size: 1rem; }

      .section-title { font-size: 1.7rem; margin-bottom: 2rem; }
      .welcome-title { font-size: 1.8rem; }
      .welcome-text { font-size: 1rem; }

      .welcome-section,
      .about-section,
      .how-it-works-section,
      .services-section,
      .gallery-preview,
      .voucher-section,
      .reviews-section,
      .faq-section { padding: 3rem 0; }

      .steps-grid { grid-template-columns: 1fr 1fr; gap: 1.5rem; }

      .gallery-grid { grid-template-columns: 1fr 1fr; }

      .voucher-grid { grid-template-columns: 1fr; }
      .about-grid { grid-template-columns: 1fr; gap: 2rem; }
      .about-content .section-title { text-align: center; }
      .about-image img { max-height: 400px; }
      .voucher-modal-grid { grid-template-columns: 1fr; }
      .voucher-preview { border-radius: 12px 12px 0 0; }
      .voucher-card { aspect-ratio: 16/9; }
      .voucher-btn-form { margin-left: 0; margin-top: 0.75rem; display: block; }

      .reviews-grid { grid-template-columns: 1fr; }

      .footer-grid { grid-template-columns: 1fr; gap: 2rem; }

      .service-header { flex-direction: column; align-items: flex-start; }
      .service-card { flex-direction: column; }
      .service-image { width: 100%; height: 200px; min-height: auto; }
      .service-card-content { padding: 1.5rem; }

      .floating-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--secondary-color, #D4AF37);
        color: var(--primary-color, #8B6F47);
        padding: 0.85rem 2.5rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.95rem;
        z-index: 99;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        transition: transform 0.3s;
        letter-spacing: 0.5px;
      }

      .floating-cta:hover {
        transform: translateX(-50%) scale(1.05);
      }

      .footer { padding: 3rem 0 2rem; }
    }

    @media (max-width: 480px) {
      .hero { height: 45vh; min-height: 300px; }
      .hero-content h1 { font-size: 1.7rem; }
      .hero-content p { font-size: 0.9rem; margin-bottom: 1.5rem; }
      .cta-btn { padding: 0.75rem 2rem; font-size: 0.85rem; }

      .section-title { font-size: 1.5rem; }
      .welcome-title { font-size: 1.5rem; }

      .steps-grid { grid-template-columns: 1fr; }
      .step-card { padding: 1.5rem 1rem; }

      .gallery-grid { grid-template-columns: 1fr; }
      .gallery-item { height: 200px; }

      .service-name { font-size: 1.1rem; }
      .service-price { font-size: 1.2rem; }
      .service-card { padding: 1.5rem; }

      .review-card { padding: 1.5rem; }
      .review-text { font-size: 0.9rem; }
      .review-author { flex-direction: column; align-items: flex-start; gap: 0.3rem; }

      .voucher-content .section-title { font-size: 1.4rem; }
      .voucher-intro { font-size: 1rem; }

      .faq-question { font-size: 0.95rem; }
      .faq-answer p { font-size: 0.9rem; }

      .floating-cta { padding: 0.75rem 2rem; font-size: 0.85rem; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  services: Service[] = [];
  serviceCategories: string[] = [];
  galleryItems: GalleryItem[] = [];
  reviews: Review[] = [];
  /** Sekcje CMS pobrane z `/api/pages/home/sections`, indeksowane po `section_key`. */
  cms: Record<string, PageSection> = {};
  lang = 'pl';
  private destroy$ = new Subject<void>();

  heroSlides: string[] = [
    'assets/images/_MG_0013.jpg',
    'assets/images/_MG_0079.jpg',
    'assets/images/_MG_0207.jpg',
    'assets/images/_MG_0327.jpg',
    'assets/images/_MG_1313.jpg'
  ];
  currentSlide = 0;
  prevSlide = -1;
  activeFaq: number | null = null;
  termsOpen = false;
  voucherFormOpen = false;
  reviewsExpanded = false;
  expandedReviewIds = new Set<number>();
  showFloatingCta = false;
  showVoucherModal = false;
  voucherSending = false;
  voucherSuccess = false;
  voucherError = false;
  voucherData: {
    sender_name: string;
    sender_email: string;
    sender_phone: string;
    recipient_name: string;
    voucher_type: 'treatment' | 'amount';
    treatment: string;
    amount: number | null;
    message: string;
  } = {
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    recipient_name: '',
    voucher_type: 'treatment',
    treatment: '',
    amount: null,
    message: ''
  };
  private scrollObserver?: IntersectionObserver;
  private heroObserver?: IntersectionObserver;

  constructor(
    private apiService: ApiService,
    private translationService: TranslationService,
    public content: ContentService,
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.lang = this.translationService.getLanguage() || 'pl';
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => (this.lang = l));

    this.loadCmsSections();
    this.loadServices();
    this.loadGallery();
    this.loadReviews();
    this.startSlider();
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initHeroObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.scrollObserver?.disconnect();
    this.heroObserver?.disconnect();
  }

  private startSlider(): void {
    interval(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.nextSlide();
    });
  }

  nextSlide(): void {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  goToSlide(index: number): void {
    if (index !== this.currentSlide) {
      this.prevSlide = this.currentSlide;
      this.currentSlide = index;
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  /** Translate a service name with fallback chain:
   *  1) DB localized translation (preferred — tłumaczenia z panelu admina),
   *  2) statyczna mapa w translation.service (legacy),
   *  3) wartość angielska / pierwsza dostępna.
   */
  translateServiceName(service: Service): string {
    const dbVal = this.pickServiceLocalized(service.name);
    if (dbVal && this.isEffectiveLangValue(service.name)) return dbVal;
    const fallback = this.serviceEnglishKey(service.name);
    if (!fallback) return dbVal || '';
    const key = `service.name.${fallback}`;
    const t = this.translationService.translate(key);
    return t === key ? (dbVal || fallback) : t;
  }

  /** Translate a service description with the same fallback chain. */
  translateServiceDescription(service: Service): string {
    const dbVal = this.pickServiceLocalized(service.description);
    if (dbVal && this.isEffectiveLangValue(service.description)) return dbVal;
    const fallback = this.serviceEnglishKey(service.name);
    if (!fallback) return dbVal || '';
    const key = `service.desc.${fallback}`;
    const t = this.translationService.translate(key);
    return t === key ? (dbVal || (typeof service.description === 'string' ? service.description : '')) : t;
  }

  /** Pick a localized service field with PL → current → EN → FI fallback. */
  private pickServiceLocalized(v: string | { [lang: string]: string } | null | undefined): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v[this.lang] || v['pl'] || v['en'] || v['fi'] || Object.values(v)[0] || '';
  }

  /** True jeśli pole jest obiektem i ma wpis w aktywnym języku (czyli admin uzupełnił PL). */
  private isEffectiveLangValue(v: string | { [lang: string]: string } | null | undefined): boolean {
    if (!v || typeof v === 'string') return false;
    return !!(v[this.lang] && v[this.lang].trim());
  }

  /** Get the original English-name (key for the legacy translation map). */
  private serviceEnglishKey(name: string | { [lang: string]: string } | null | undefined): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name['en'] || name['pl'] || name['fi'] || Object.values(name)[0] || '';
  }

  /** Translate a category label with fallback to the raw value. */
  translateCategory(category: string): string {
    const key = `category.${category}`;
    const t = this.translationService.translate(key);
    return t === key ? category : t;
  }

  /**
   * Render FAQ answer text as structured HTML consistent with Kobido styling.
   * Supports:
   *  - lines starting with "• " or "- " → bullet list
   *  - lines ending with ":" (not part of a sentence) → section heading
   *  - blank lines → paragraph break
   *  - any other text → paragraph
   */
  formatFaqAnswer(text: string): SafeHtml {
    if (!text) return '';
    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const lines = text.split('\n');
    const out: string[] = [];
    let inList = false;
    let inOl = false;
    let listMode = false; // true when we are in an auto-list after a heading
    let paraBuf: string[] = [];

    const flushPara = () => {
      if (paraBuf.length) {
        out.push('<p>' + escape(paraBuf.join(' ')) + '</p>');
        paraBuf = [];
      }
    };
    const openList = () => {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inList) { out.push('<ul>'); inList = true; }
    };
    const openOl = () => {
      if (inList) { out.push('</ul>'); inList = false; }
      if (!inOl) { out.push('<ol class="faq-ol">'); inOl = true; }
    };
    const closeList = () => {
      if (inList) { out.push('</ul>'); inList = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      listMode = false;
    };

    const isHeading = (line: string) =>
      line.endsWith(':') && line.length <= 80 && !/[.!?]/.test(line.slice(0, -1));
    const numberedRe = /^(\d+)[.)]\s+(.*)$/;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        flushPara();
        closeList();
        continue;
      }
      // numbered list item "1. text" or "1) text"
      const numMatch = line.match(numberedRe);
      if (numMatch) {
        flushPara();
        openOl();
        out.push('<li>' + escape(numMatch[2].trim()) + '</li>');
        listMode = true;
        continue;
      }
      // explicit bullet
      if (line.startsWith('• ') || line.startsWith('- ')) {
        flushPara();
        openList();
        out.push('<li>' + escape(line.slice(2).trim()) + '</li>');
        listMode = true;
        continue;
      }
      // heading (short line ending with ":")
      if (isHeading(line)) {
        flushPara();
        closeList();
        out.push('<strong class="faq-heading">' + escape(line) + '</strong>');
        listMode = true; // subsequent non-empty lines become list items
        continue;
      }
      // inside auto-list → treat each line as <li>
      if (listMode) {
        flushPara();
        openList();
        out.push('<li>' + escape(line) + '</li>');
        continue;
      }
      paraBuf.push(line);
    }
    flushPara();
    closeList();

    return this.sanitizer.bypassSecurityTrustHtml(out.join(''));
  }

  getServicesByCategory(category: string): Service[] {
    return this.services.filter(s => s.category === category);
  }

  getServiceImage(service: Service): string | null {
    const name = this.serviceEnglishKey(service.name);
    const images: { [key: string]: string } = {
      'Kobido Facelifting Massage': 'assets/images/_MG_1327.jpg',
      'Head Spa Classic Ritual': 'assets/images/_MG_0275.jpg',
      'Head Spa Classic & Face': 'assets/images/_MG_1387.jpg',
      'VIP Head Spa Ritual': 'assets/images/_MG_0453.jpg',
    };
    return images[name] || null;
  }

  /* ----------------------- CMS (page_sections) ----------------------- */

  private loadCmsSections(): void {
    this.apiService.getPageSections('home').subscribe({
      next: (data) => {
        const map: Record<string, PageSection> = {};
        for (const s of data || []) map[s.section_key] = s;
        this.cms = map;

        // Hero slider — jeśli admin wgrał własną listę slajdów, używamy jej.
        const heroSlides = this.cmsMetaArray('hero', 'slides');
        if (heroSlides && heroSlides.length) {
          this.heroSlides = heroSlides;
          this.currentSlide = 0;
        }
      },
      error: (err) => console.error('Failed to load home page sections:', err),
    });
  }

  /** Zwraca title sekcji z bazy lub fallback z translation.service. */
  cmsTitle(sectionKey: string, fallbackTranslateKey?: string): string {
    const s = this.cms[sectionKey];
    const v = s ? this.content.pickString(s.title, this.lang) : '';
    return v || (fallbackTranslateKey ? this.translate(fallbackTranslateKey) : '');
  }

  cmsSubtitle(sectionKey: string, fallbackTranslateKey?: string): string {
    const s = this.cms[sectionKey];
    const v = s ? this.content.pickString(s.subtitle, this.lang) : '';
    return v || (fallbackTranslateKey ? this.translate(fallbackTranslateKey) : '');
  }

  cmsBody(sectionKey: string, fallbackTranslateKey?: string): string {
    const s = this.cms[sectionKey];
    const v = s ? this.content.pickString(s.body, this.lang) : '';
    return v || (fallbackTranslateKey ? this.translate(fallbackTranslateKey) : '');
  }

  /** Wartość tekstowa z `meta` (np. 'cta_url'). */
  cmsMetaString(sectionKey: string, metaKey: string, fallback = ''): string {
    const s = this.cms[sectionKey];
    const v = s?.meta?.[metaKey];
    return typeof v === 'string' && v.length ? v : fallback;
  }

  /** Tablica z `meta` (np. 'slides'). */
  cmsMetaArray(sectionKey: string, metaKey: string): string[] | null {
    const s = this.cms[sectionKey];
    const v = s?.meta?.[metaKey];
    return Array.isArray(v) ? v : null;
  }

  /** Etykieta CTA z meta (`cta_label_pl|en|fi`) z fallbackiem do tłumaczenia. */
  cmsCtaLabel(sectionKey: string, fallbackTranslateKey?: string, prefix = 'cta_label'): string {
    const s = this.cms[sectionKey];
    const m: any = s?.meta || {};
    const v = m[`${prefix}_${this.lang}`] || m[`${prefix}_pl`] || m[`${prefix}_en`] || m[`${prefix}_fi`];
    return v || (fallbackTranslateKey ? this.translate(fallbackTranslateKey) : '');
  }

  /** Lokalizowana zawartość `content` (np. items dla sekcji 'how-it-works'). */
  cmsContent<T = any>(sectionKey: string): T | null {
    const s = this.cms[sectionKey];
    return s ? (this.content.pickAny<T>(s.content as any, this.lang)) : null;
  }

  /** Kroki wizyty (sekcja 'how-it-works'). Domyślnie używa fallback z translation.service. */
  cmsSteps(): Array<{ icon: string; title: string; desc: string }> {
    const c = this.cmsContent<{ items?: Array<{ icon: string; title: string; desc: string }> }>('how-it-works');
    return Array.isArray(c?.items) ? c!.items! : [];
  }

  /** Ścieżka obrazka sekcji z fallbackiem do statycznego asset-a. */
  cmsImage(sectionKey: string, fallback: string): string {
    const s = this.cms[sectionKey];
    return s?.image_url ? this.content.resolveImage(s.image_url) : fallback;
  }

  /** True gdy w bazie istnieje niepusta wartość body dla tej sekcji. */
  cmsHasBody(sectionKey: string): boolean {
    const s = this.cms[sectionKey];
    return !!(s && this.content.pickString(s.body, this.lang).trim());
  }

  private loadServices(): void {
    this.apiService.getServices().subscribe(
      (data) => {
        this.services = data.sort((a, b) => a.order - b.order);
        // Extract unique categories preserving order
        const seen = new Set<string>();
        this.serviceCategories = [];
        for (const s of this.services) {
          if (!seen.has(s.category)) {
            seen.add(s.category);
            this.serviceCategories.push(s.category);
          }
        }
      },
      (error) => console.error('Error loading services:', error)
    );
  }

  private loadGallery(): void {
    this.apiService.getGallery().subscribe(
      (data) => this.galleryItems = data,
      (error) => console.error('Error loading gallery:', error)
    );
  }

  private loadReviews(): void {
    this.apiService.getApprovedReviews().subscribe(
      (data) => this.reviews = data,
      (error) => console.error('Error loading reviews:', error)
    );
  }

  getReviewContent(review: Review): string {
    const currentLang = this.translationService.getLanguage();
    if (typeof review.content === 'string') {
      return review.content;
    }
    return review.content[currentLang] || review.content['en'] || Object.values(review.content)[0] || '';
  }

  isReviewLong(review: Review): boolean {
    return this.getReviewContent(review).length > 220;
  }

  isReviewExpanded(review: Review): boolean {
    return this.expandedReviewIds.has(review.id);
  }

  toggleReview(review: Review): void {
    if (this.expandedReviewIds.has(review.id)) {
      this.expandedReviewIds.delete(review.id);
    } else {
      this.expandedReviewIds.add(review.id);
    }
  }

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }


  openVoucherModal(): void {
    this.showVoucherModal = true;
    this.voucherSuccess = false;
    this.voucherError = false;
    this.voucherData = { sender_name: '', sender_email: '', sender_phone: '', recipient_name: '', voucher_type: 'treatment', treatment: '', amount: null, message: '' };
    document.body.style.overflow = 'hidden';
  }

  closeVoucherModal(): void {
    this.showVoucherModal = false;
    document.body.style.overflow = '';
  }

  submitVoucher(): void {
    this.voucherSending = true;
    this.voucherError = false;

    // Build the payload — map amount voucher to a readable treatment string
    // so the backend (and email templates) keep working unchanged.
    const payload = { ...this.voucherData } as any;
    if (this.voucherData.voucher_type === 'amount') {
      const amount = this.voucherData.amount || 0;
      const label = this.translate('voucherForm.amountLabel').replace('{amount}', String(amount));
      payload.treatment = label;
      payload.amount = amount;
    } else {
      payload.amount = null;
    }

    this.apiService.sendVoucher(payload).subscribe(
      () => {
        this.voucherSending = false;
        this.voucherSuccess = true;
      },
      () => {
        this.voucherSending = false;
        this.voucherError = true;
      }
    );
  }

  setVoucherType(type: 'treatment' | 'amount'): void {
    this.voucherData.voucher_type = type;
    if (type === 'treatment') {
      this.voucherData.amount = null;
    } else {
      this.voucherData.treatment = '';
    }
  }

  private initScrollAnimations(): void {
    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      const elements = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
      elements.forEach((el: Element) => this.scrollObserver!.observe(el));
    }, 100);
  }

  private initHeroObserver(): void {
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      this.heroObserver = new IntersectionObserver((entries) => {
        this.showFloatingCta = !entries[0].isIntersecting;
      }, { threshold: 0.1 });
      this.heroObserver.observe(heroEl);
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button
        *ngFor="let lang of languages"
        [class.active]="lang === currentLanguage"
        (click)="switchLanguage(lang)"
        [title]="getLanguageName(lang)"
        class="lang-btn">
        <img [src]="getFlagUrl(lang)" [alt]="getLanguageName(lang)" class="flag-img">
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      min-width: 108px;
    }

    .lang-btn {
      background: none;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0.2rem;
      border-radius: 4px;
      transition: border-color 0.3s, background 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 26px;
      box-sizing: border-box;
    }

    .lang-btn:hover {
      border-color: var(--secondary-color, #D4AF37);
    }

    .lang-btn.active {
      border-color: var(--secondary-color, #D4AF37);
      background: rgba(212, 175, 55, 0.1);
    }

    .flag-img {
      width: 24px;
      height: 18px;
      object-fit: cover;
      border-radius: 2px;
      display: block;
    }
  `]
})
export class LanguageSwitcherComponent {
  languages: string[] = [];
  currentLanguage: string = 'en';

  constructor(private translationService: TranslationService) {
    this.languages = this.translationService.getAvailableLanguages();
    this.currentLanguage = this.translationService.getLanguage();

    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  switchLanguage(lang: string): void {
    this.translationService.setLanguage(lang);
  }

  getFlagUrl(lang: string): string {
    const codes: { [key: string]: string } = {
      'en': 'gb',
      'pl': 'pl',
      'fi': 'fi'
    };
    const code = codes[lang] || lang;
    return `https://flagcdn.com/w40/${code}.png`;
  }

  getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'en': 'English',
      'pl': 'Polski',
      'fi': 'Suomi'
    };
    return names[lang] || lang;
  }
}


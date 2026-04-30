import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

export interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_primary: string;
  font_secondary: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<ThemeSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.apiService.getSettings().subscribe(
      (settings: any) => {
        const theme: ThemeSettings = {
          primary_color: settings.primary_color?.value || '#8B6F47',
          secondary_color: settings.secondary_color?.value || '#D4AF37',
          accent_color: settings.accent_color?.value || '#E8DCC8',
          font_primary: settings.font_primary?.value || 'Nunito, sans-serif',
          font_secondary: settings.font_secondary?.value || 'Playfair Display, serif',
        };
        this.applyTheme(theme);
        this.settingsSubject.next(theme);
      }
    );
  }

  private applyTheme(theme: ThemeSettings): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary_color);
    root.style.setProperty('--secondary-color', theme.secondary_color);
    root.style.setProperty('--accent-color', theme.accent_color);
    root.style.setProperty('--font-primary', theme.font_primary);
    root.style.setProperty('--font-secondary', theme.font_secondary);
  }

  getSettings(): ThemeSettings | null {
    return this.settingsSubject.value;
  }
}


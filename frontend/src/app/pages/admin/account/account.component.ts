import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Konto</h1>
        <p class="lead">Zarządzaj danymi swojego konta administratora.</p>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div class="card">
      <h2>Zmiana hasła</h2>
      <p class="muted">
        Hasło musi mieć co najmniej 8 znaków i różnić się od aktualnego.
        Po zmianie wszystkie inne urządzenia (poza tym) zostaną wylogowane.
      </p>

      <form #f="ngForm" (ngSubmit)="onSubmit(f)" autocomplete="off" class="form">
        <div class="row">
          <label for="current_password">Aktualne hasło</label>
          <div class="input-wrap">
            <input
              [type]="showCurrent ? 'text' : 'password'"
              id="current_password"
              name="current_password"
              [(ngModel)]="form.current_password"
              required
              autocomplete="current-password"
            />
            <button type="button" class="toggle" (click)="showCurrent = !showCurrent" tabindex="-1">
              {{ showCurrent ? '🙈' : '👁' }}
            </button>
          </div>
          <small class="field-error" *ngIf="errors['current_password']">{{ errors['current_password'] }}</small>
        </div>

        <div class="row">
          <label for="new_password">Nowe hasło</label>
          <div class="input-wrap">
            <input
              [type]="showNew ? 'text' : 'password'"
              id="new_password"
              name="new_password"
              [(ngModel)]="form.new_password"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <button type="button" class="toggle" (click)="showNew = !showNew" tabindex="-1">
              {{ showNew ? '🙈' : '👁' }}
            </button>
          </div>
          <small class="field-error" *ngIf="errors['new_password']">{{ errors['new_password'] }}</small>
        </div>

        <div class="row">
          <label for="new_password_confirmation">Powtórz nowe hasło</label>
          <div class="input-wrap">
            <input
              [type]="showNew ? 'text' : 'password'"
              id="new_password_confirmation"
              name="new_password_confirmation"
              [(ngModel)]="form.new_password_confirmation"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <small class="field-error" *ngIf="mismatch()">Hasła nie są identyczne.</small>
        </div>

        <div class="actions">
          <button type="submit" class="btn primary" [disabled]="saving || f.invalid || mismatch()">
            {{ saving ? 'Zapisywanie…' : 'Zmień hasło' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
  styles: [`
    .card {
      background: var(--admin-surface, #fff);
      border: 1px solid var(--admin-border, #ebe6dd);
      border-radius: 12px;
      padding: 1.5rem 1.6rem;
      max-width: 560px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .card h2 { margin: 0 0 0.4rem; font-size: 1.15rem; }
    .card .muted { color: #8a817a; font-size: 0.85rem; margin: 0 0 1.2rem; }

    .form { display: flex; flex-direction: column; gap: 1rem; }
    .row { display: flex; flex-direction: column; gap: 0.35rem; }
    .row label { font-size: 0.82rem; font-weight: 600; color: #2d2a26; }

    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-wrap input {
      flex: 1;
      padding: 0.6rem 2.2rem 0.6rem 0.75rem;
      border: 1px solid var(--admin-border, #ebe6dd);
      border-radius: 8px;
      font-size: 0.92rem;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .input-wrap input:focus {
      outline: none;
      border-color: var(--admin-accent, #C9A96E);
      box-shadow: 0 0 0 3px rgba(201,169,110,0.18);
    }
    .toggle {
      position: absolute; right: 6px;
      background: transparent; border: 0; cursor: pointer;
      font-size: 1rem; padding: 0.25rem 0.4rem; line-height: 1;
      opacity: 0.65;
    }
    .toggle:hover { opacity: 1; }

    .field-error { color: var(--admin-danger, #c0392b); font-size: 0.78rem; }

    .actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
  `]
})
export class AdminAccountComponent {
  private auth = inject(AuthService);

  form = {
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  };

  showCurrent = false;
  showNew = false;
  saving = false;
  message = '';
  isError = false;
  errors: Record<string, string> = {};

  mismatch(): boolean {
    return !!this.form.new_password
      && !!this.form.new_password_confirmation
      && this.form.new_password !== this.form.new_password_confirmation;
  }

  onSubmit(f: NgForm): void {
    this.errors = {};
    this.message = '';
    this.isError = false;

    if (f.invalid || this.mismatch()) return;
    if (this.form.new_password === this.form.current_password) {
      this.errors['new_password'] = 'Nowe hasło musi się różnić od aktualnego.';
      return;
    }

    this.saving = true;
    this.auth.changePassword(
      this.form.current_password,
      this.form.new_password,
      this.form.new_password_confirmation,
    ).subscribe({
      next: (res) => {
        this.saving = false;
        this.message = res?.message || 'Hasło zostało zmienione.';
        this.isError = false;
        this.form = { current_password: '', new_password: '', new_password_confirmation: '' };
        f.resetForm();
        setTimeout(() => this.message = '', 4000);
      },
      error: (err) => {
        this.saving = false;
        this.isError = true;
        const errs = err?.error?.errors;
        if (errs && typeof errs === 'object') {
          for (const key of Object.keys(errs)) {
            this.errors[key] = Array.isArray(errs[key]) ? errs[key][0] : String(errs[key]);
          }
          this.message = err?.error?.message || 'Nie udało się zmienić hasła. Sprawdź formularz.';
        } else {
          this.message = err?.error?.message || 'Nie udało się zmienić hasła.';
        }
      }
    });
  }
}


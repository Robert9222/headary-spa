import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Admin Login</h1>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@headary-spa.local"
              required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter password"
              required>
          </div>

          <button type="submit" class="login-btn" [disabled]="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background:
        radial-gradient(ellipse at top left, rgba(201,169,110,0.25), transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(139,111,71,0.25), transparent 50%),
        linear-gradient(135deg, #2d2a26 0%, #3a352f 100%);
      font-family: 'Inter', system-ui, sans-serif;
    }

    .login-box {
      background: #fff;
      padding: 2.5rem 2.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
      width: 100%;
      max-width: 420px;
    }

    .brand {
      display: flex; align-items: center; gap: 0.8rem;
      margin-bottom: 2rem;
    }
    .brand .mark {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #C9A96E, #b5935a);
      color: #2d2a26;
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: 1.5rem;
      display: grid; place-items: center;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(201, 169, 110, 0.4);
    }
    .brand strong { display: block; font-size: 1.05rem; color: #2d2a26; }
    .brand span { font-size: 0.75rem; letter-spacing: 1px; color: #8a817a; text-transform: uppercase; }

    .form-group { margin-bottom: 1.2rem; }

    label {
      display: block;
      margin-bottom: 0.4rem;
      color: #5a524a;
      font-weight: 600;
      font-size: 0.85rem;
    }

    input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #d9d0c0;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    input:focus {
      outline: none;
      border-color: #C9A96E;
      box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
    }

    .login-btn {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(180deg, #C9A96E, #b5935a);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      margin-top: 0.4rem;
      box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
    }

    .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201, 169, 110, 0.4); }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .error-message {
      color: #8c3a3a;
      padding: 0.8rem 1rem;
      background: #fde4e4;
      border: 1px solid #f5c2bf;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }

  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string = '';


  onLogin(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        this.error = 'Invalid credentials';
        this.isLoading = false;
      }
    });
  }
}


import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-shell" [class.sidebar-collapsed]="collapsed">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">H</div>
          <div class="brand-text">
            <strong>Headary SPA</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <button class="collapse-btn" (click)="collapsed = !collapsed" [title]="collapsed ? 'Rozwiń' : 'Zwiń'">
          {{ collapsed ? '»' : '«' }}
        </button>

        <nav class="nav">
          <a *ngFor="let item of nav"
             [routerLink]="item.path"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: !!item.exact }"
             class="nav-item"
             [title]="item.label">
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="avatar">{{ userInitials }}</div>
            <div class="who">
              <strong>{{ currentUser?.name || 'Admin' }}</strong>
              <span>{{ currentUser?.email || '—' }}</span>
            </div>
          </div>
          <button class="logout" (click)="onLogout()" title="Wyloguj">⎋</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --admin-bg: #f4f1ec;
      --admin-surface: #ffffff;
      --admin-surface-2: #fafaf7;
      --admin-border: #ebe6dd;
      --admin-primary: #2d2a26;
      --admin-accent: #C9A96E;
      --admin-accent-soft: #E8DCC8;
      --admin-text: #2d2a26;
      --admin-muted: #8a817a;
      --admin-danger: #c0392b;
      --admin-success: #2e7d57;
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: var(--admin-text);
    }

    .admin-shell {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
      background: var(--admin-bg);
      transition: grid-template-columns 0.25s ease;
    }
    .admin-shell.sidebar-collapsed { grid-template-columns: 72px 1fr; }

    /* ------ Sidebar ------ */
    .sidebar {
      background: linear-gradient(180deg, #2d2a26 0%, #3a352f 100%);
      color: #f5efe4;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
      box-shadow: 4px 0 24px rgba(0,0,0,0.08);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 1.3rem 1.2rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-mark {
      width: 40px; height: 40px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--admin-accent), #b5935a);
      color: #2d2a26;
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: 1.3rem;
      display: grid; place-items: center;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
    }
    .brand-text { display: flex; flex-direction: column; line-height: 1.2; overflow: hidden; }
    .brand-text strong { font-size: 0.95rem; letter-spacing: 0.3px; }
    .brand-text span { font-size: 0.72rem; opacity: 0.6; letter-spacing: 1px; text-transform: uppercase; }

    .collapse-btn {
      position: absolute;
      top: 1.4rem; right: -12px;
      width: 24px; height: 24px;
      background: var(--admin-accent);
      border: 3px solid #2d2a26;
      border-radius: 50%;
      color: #2d2a26;
      cursor: pointer;
      font-size: 0.7rem;
      font-weight: bold;
      z-index: 2;
      display: grid; place-items: center;
      line-height: 1;
    }

    .nav { display: flex; flex-direction: column; padding: 1rem 0.6rem; gap: 0.2rem; flex: 1; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 0.9rem;
      padding: 0.7rem 0.9rem;
      color: #d9d0c0;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.2s, color 0.2s, transform 0.15s;
      font-size: 0.92rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .nav-item .icon {
      width: 24px; text-align: center; font-size: 1.1rem; flex-shrink: 0;
      filter: grayscale(0.3);
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .nav-item.active {
      background: linear-gradient(90deg, rgba(201,169,110,0.2), rgba(201,169,110,0.05));
      color: #fff;
      box-shadow: inset 3px 0 0 var(--admin-accent);
    }

    .sidebar-footer {
      padding: 0.9rem 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 0.6rem;
    }
    .user-chip { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--admin-accent-soft); color: #2d2a26;
      display: grid; place-items: center;
      font-weight: 700; flex-shrink: 0;
    }
    .who { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; overflow: hidden; }
    .who strong { font-size: 0.85rem; color: #fff; }
    .who span { font-size: 0.72rem; opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .logout {
      background: transparent; color: #d9d0c0; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; width: 34px; height: 34px; cursor: pointer;
      font-size: 1rem; transition: all 0.2s;
    }
    .logout:hover { background: var(--admin-danger); color: #fff; border-color: transparent; }

    /* Collapsed mode */
    .sidebar-collapsed .brand-text,
    .sidebar-collapsed .nav-item .label,
    .sidebar-collapsed .who { display: none; }
    .sidebar-collapsed .nav-item { justify-content: center; padding: 0.7rem 0.5rem; }
    .sidebar-collapsed .brand { justify-content: center; padding: 1.3rem 0.5rem; }
    .sidebar-collapsed .sidebar-footer { flex-direction: column; padding: 0.9rem 0.5rem; }

    /* ------ Content ------ */
    .content {
      padding: 0;
      overflow-x: hidden;
      min-height: 100vh;
    }

    @media (max-width: 900px) {
      .admin-shell { grid-template-columns: 72px 1fr; }
      .sidebar-collapsed.admin-shell { grid-template-columns: 260px 1fr; }
      .brand-text, .nav-item .label, .who { display: none; }
      .sidebar-collapsed .brand-text,
      .sidebar-collapsed .nav-item .label,
      .sidebar-collapsed .who { display: flex; }
      .nav-item { justify-content: center; }
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  collapsed = false;
  currentUser: any = this.authService.getCurrentUser();

  nav: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '▦', exact: true },
    { path: '/admin/pages', label: 'Strony (CMS)', icon: '✎' },
    { path: '/admin/reviews', label: 'Opinie', icon: '★' },
    { path: '/admin/gallery', label: 'Galeria', icon: '▣' },
    { path: '/admin/services', label: 'Usługi', icon: '✿' },
    { path: '/admin/settings', label: 'Ustawienia', icon: '⚙' },
    { path: '/admin/account', label: 'Konto', icon: '👤' },
  ];

  get userInitials(): string {
    const name = this.currentUser?.name || 'A';
    return name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/admin/login']),
      error: () => this.router.navigate(['/admin/login']),
    });
  }
}


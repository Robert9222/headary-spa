import { Routes } from '@angular/router';
import { HomeComponent } from '@pages/home/home.component';
import { ServicesComponent } from '@pages/services/services.component';
import { KobidoComponent } from '@pages/services/kobido/kobido.component';
import { HeadarySpaComponent } from '@pages/headary-spa/headary-spa.component';
import { GalleryComponent } from '@pages/gallery/gallery.component';
import { AdminLoginComponent } from '@pages/admin/login/login.component';
import { AdminLayoutComponent } from '@pages/admin/_shared/admin-layout.component';
import { AdminDashboardComponent } from '@pages/admin/dashboard/dashboard.component';
import { PagesListComponent } from '@pages/admin/pages/pages-list.component';
import { PageSectionsEditorComponent } from '@pages/admin/pages/page-sections-editor.component';
import { AdminReviewsComponent } from '@pages/admin/reviews/reviews.component';
import { AdminGalleryComponent } from '@pages/admin/gallery/gallery.component';
import { AdminServicesComponent } from '@pages/admin/services/services.component';
import { AdminSettingsComponent } from '@pages/admin/settings/settings.component';
import { AdminAccountComponent } from '@pages/admin/account/account.component';
import { AdminEmployeesComponent } from '@pages/admin/employees/employees.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'kobido', component: KobidoComponent },
  // Backward-compat redirect from old URL
  { path: 'services/kobido', redirectTo: 'kobido', pathMatch: 'full' },
  { path: 'headary-spa', component: HeadarySpaComponent },
  { path: 'gallery', component: GalleryComponent },

  // Admin login (no layout)
  { path: 'admin/login', component: AdminLoginComponent },

  // Admin area (shared layout with sidebar, all children protected by AdminGuard)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'pages', component: PagesListComponent },
      { path: 'pages/:pageKey/sections', component: PageSectionsEditorComponent },
      { path: 'reviews', component: AdminReviewsComponent },
      { path: 'gallery', component: AdminGalleryComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'employees', component: AdminEmployeesComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'account', component: AdminAccountComponent },
    ],
  },
];

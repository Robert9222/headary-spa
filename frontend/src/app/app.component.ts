import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Headary Spa';
  showHeader$: Observable<boolean>;

  constructor(private settingsService: SettingsService, private router: Router) {
    this.showHeader$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => !this.router.url.startsWith('/admin')),
    );
  }
}

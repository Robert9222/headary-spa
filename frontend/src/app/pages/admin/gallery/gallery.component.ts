import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services/api.service';

interface GalleryFile {
  name: string;
  path: string;
  url: string;
  size: number;
  modified: number;
  _deleting?: boolean;
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Galeria</h1>
        <p class="lead">
          Wgrywaj i usuwaj zdjęcia wyświetlane w galerii na stronie publicznej.
          Pliki przechowywane są w katalogu <code>storage/app/public/images</code>.
        </p>
      </div>
      <div class="actions">
        <label class="btn primary" [class.disabled]="uploading">
          <input type="file" accept="image/*" multiple (change)="onUpload($event)" hidden />
          {{ uploading ? 'Wgrywanie…' : '+ Dodaj zdjęcie' }}
        </label>
      </div>
    </div>

    <div class="banner" *ngIf="message" [class.error]="isError">
      <span>{{ message }}</span>
      <button class="close" (click)="message=''">×</button>
    </div>

    <div *ngIf="loading" class="empty">Ładowanie galerii…</div>

    <div *ngIf="!loading && files.length === 0" class="empty">
      <div class="icon">▣</div>
      <h3 style="margin: 0 0 0.5rem;">Galeria jest pusta</h3>
      <p>Kliknij „+ Dodaj zdjęcie", aby wgrać pierwsze.</p>
    </div>

    <div class="grid gallery-grid" *ngIf="!loading && files.length">
      <div class="tile" *ngFor="let f of files" [class.busy]="f._deleting">
        <div class="thumb">
          <img [src]="f.url" [alt]="f.name" loading="lazy" />
        </div>
        <div class="meta">
          <strong [title]="f.name">{{ f.name }}</strong>
          <small>{{ formatSize(f.size) }} · {{ f.modified * 1000 | date:'dd.MM.yyyy HH:mm' }}</small>
        </div>
        <div class="tile-actions">
          <a class="btn ghost sm" [href]="f.url" target="_blank" rel="noopener">Podgląd</a>
          <button class="btn sm" (click)="copyUrl(f)">Kopiuj URL</button>
          <button class="btn danger sm" (click)="remove(f)" [disabled]="f._deleting">
            {{ f._deleting ? '…' : 'Usuń' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../_shared/admin.styles.scss'],
  styles: [`
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .tile {
      background: var(--admin-surface, #fff);
      border: 1px solid var(--admin-border, #ebe6dd);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .tile:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .tile.busy { opacity: 0.55; pointer-events: none; }
    .thumb {
      aspect-ratio: 4 / 3;
      background: #f4f1ec;
      display: grid; place-items: center;
      overflow: hidden;
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .meta {
      padding: 0.55rem 0.7rem 0.3rem;
      display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;
    }
    .meta strong {
      font-size: 0.82rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .meta small { font-size: 0.7rem; color: #8a817a; }
    .tile-actions {
      display: flex; gap: 0.3rem; flex-wrap: wrap;
      padding: 0.55rem 0.7rem 0.7rem;
    }
    .btn.sm { padding: 0.32rem 0.6rem; font-size: 0.78rem; }
    .btn.disabled { opacity: 0.6; pointer-events: none; }
    label.btn { cursor: pointer; }
  `]
})
export class AdminGalleryComponent implements OnInit {
  private api = inject(ApiService);

  files: GalleryFile[] = [];
  loading = true;
  uploading = false;
  message = '';
  isError = false;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.api.getGalleryFiles().subscribe({
      next: (data) => {
        this.files = (data || []).map(f => ({ ...f }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showError('Nie udało się pobrać listy plików galerii.');
      }
    });
  }

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    if (!list || !list.length) return;
    const files = Array.from(list);
    input.value = '';
    this.uploadMany(files);
  }

  private uploadMany(files: File[]): void {
    this.uploading = true;
    let done = 0;
    let failed = 0;
    const next = () => {
      if (done + failed >= files.length) {
        this.uploading = false;
        if (failed === 0) {
          this.showOk(`Dodano ${done} ${done === 1 ? 'plik' : 'plików'}.`);
        } else {
          this.showError(`Wgrano ${done}/${files.length}. Niepowodzenia: ${failed}.`);
        }
        this.load();
      }
    };
    for (const f of files) {
      this.api.uploadGalleryFile(f).subscribe({
        next: () => { done++; next(); },
        error: (err) => {
          console.error(err);
          failed++;
          next();
        }
      });
    }
  }

  remove(f: GalleryFile): void {
    if (!confirm(`Usunąć plik „${f.name}"? Tej operacji nie da się cofnąć.`)) return;
    f._deleting = true;
    this.api.deleteGalleryFile(f.name).subscribe({
      next: () => {
        this.files = this.files.filter(x => x.name !== f.name);
        this.showOk('Usunięto plik.');
      },
      error: (err) => {
        console.error(err);
        f._deleting = false;
        this.showError('Nie udało się usunąć pliku.');
      }
    });
  }

  copyUrl(f: GalleryFile): void {
    const url = f.url;
    const done = () => this.showOk('Skopiowano URL do schowka.');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, () => this.fallbackCopy(url, done));
    } else {
      this.fallbackCopy(url, done);
    }
  }

  private fallbackCopy(text: string, done: () => void): void {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch {
      this.showError('Nie udało się skopiować URL.');
    }
  }

  formatSize(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private showOk(m: string) { this.message = m; this.isError = false; setTimeout(() => this.message = '', 2500); }
  private showError(m: string) { this.message = m; this.isError = true; }
}


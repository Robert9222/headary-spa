import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ContentService } from '../../services/content.service';
import { GalleryItem } from '../../models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gallery-page">
      <div class="container">
        <h1>Gallery</h1>

        <div class="gallery-grid">
          <div *ngFor="let item of galleryItems"
               class="gallery-card"
               (click)="openLightbox(item)">
            <img [src]="content.resolveImage(item.image_url)" [alt]="item.title">
            <div class="overlay">
              <p>{{ item.title }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div *ngIf="selectedItem" class="lightbox" (click)="closeLightbox()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeLightbox()">×</button>
          <img [src]="content.resolveImage(selectedItem.image_url)" [alt]="selectedItem.title">
          <div class="lightbox-info">
            <h2>{{ selectedItem.title }}</h2>
            <p>{{ selectedItem.description }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-page {
      min-height: 100vh;
      padding: 3rem 0;
      background: #f9f9f9;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      font-size: 2.5rem;
      font-family: var(--font-secondary);
      color: var(--primary-color);
      margin-bottom: 3rem;
      text-align: center;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .gallery-card {
      position: relative;
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      height: 250px;
    }

    .gallery-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .gallery-card:hover img {
      transform: scale(1.1);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: flex-end;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .gallery-card:hover .overlay {
      opacity: 1;
    }

    .overlay p {
      color: white;
      padding: 1rem;
      width: 100%;
      margin: 0;
      font-weight: bold;
    }

    /* Lightbox styles */
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s;
    }

    @keyframes slideIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .lightbox-content img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
    }

    .lightbox-info {
      background: white;
      padding: 1.5rem;
      color: var(--primary-color);
    }

    .lightbox-info h2 {
      margin: 0 0 0.5rem 0;
      font-family: var(--font-secondary);
    }

    .lightbox-info p {
      margin: 0;
      color: #666;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      z-index: 1001;
      transition: background 0.3s;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.4);
    }
  `]
})
export class GalleryComponent implements OnInit {
  galleryItems: GalleryItem[] = [];
  selectedItem: GalleryItem | null = null;

  constructor(private apiService: ApiService, public content: ContentService) {}

  ngOnInit(): void {
    this.apiService.getGallery().subscribe(
      (data) => this.galleryItems = data.sort((a, b) => a.order - b.order),
      (error) => console.error('Error loading gallery:', error)
    );
  }

  openLightbox(item: GalleryItem): void {
    this.selectedItem = item;
  }

  closeLightbox(): void {
    this.selectedItem = null;
  }
}


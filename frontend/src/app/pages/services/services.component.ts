import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Service } from '../../models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="services-page">
      <div class="container">
        <h1>Our Services</h1>

        <div class="services-grid">
          <div *ngFor="let service of services" class="service-detail-card">
            <img [src]="service.image_url" [alt]="service.name" class="service-image">
            <div class="service-info">
              <h2>{{ service.name }}</h2>
              <p class="description">{{ service.description }}</p>

              <div class="service-meta">
                <div class="meta-item">
                  <strong>Price:</strong>
                  <span class="price">{{ service.price | currency }}</span>
                </div>
                <div class="meta-item">
                  <strong>Duration:</strong>
                  <span>{{ service.duration_minutes }} minutes</span>
                </div>
              </div>

              <a href="https://timma.no/salong/headary-spa" target="_blank" class="book-btn">
                Book This Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-page {
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

    .services-grid {
      display: grid;
      gap: 2rem;
    }

    .service-detail-card {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .service-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 4px;
    }

    .service-info h2 {
      font-size: 1.8rem;
      color: var(--primary-color);
      margin: 0 0 1rem 0;
      font-family: var(--font-secondary);
    }

    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .service-meta {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--accent-color, #E8DCC8);
      border-radius: 4px;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-size: 1.5rem;
      color: var(--secondary-color);
      font-weight: bold;
    }

    .book-btn {
      background: var(--secondary-color);
      color: var(--primary-color);
      padding: 0.8rem 2rem;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      display: inline-block;
      transition: transform 0.3s;
    }

    .book-btn:hover {
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      .service-detail-card {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getServices().subscribe(
      (data) => this.services = data.sort((a, b) => a.order - b.order),
      (error) => console.error('Error loading services:', error)
    );
  }

  isKobido(service: Service): boolean {
    const name = typeof service.name === 'string'
      ? service.name
      : (service.name as any)?.en ?? '';
    return name.toLowerCase().includes('kobido');
  }
}


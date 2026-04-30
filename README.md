# 🧖‍♀️ Headary Spa - Luxury Wellness Website

A complete web application for a luxury spa business featuring a modern Angular frontend, Laravel PHP backend, and PostgreSQL database.

## 🎯 Features

### For Customers
- 🏠 Beautiful home page with hero section and featured services
- 🛀 Detailed services showcase with pricing and duration
- 📸 Stunning gallery with lightbox viewer
- 📅 Easy online booking integration with Timma
- 📱 Fully responsive design
- 🎨 Elegant color scheme inspired by luxury spa aesthetics

### For Administrators
- 🔐 Secure login with token-based authentication
- 📊 Admin dashboard with quick statistics
- ⚙️ Complete service management (CRUD)
- 🖼️ Gallery image management
- 👥 Staff/employee management
- 📅 Appointment management
- 🎨 Theme customization (colors, fonts, text)
- 📊 Settings management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PHP 8.2+
- PostgreSQL 14+
- Composer
- npm

### Installation

1. **Clone/Extract the project**
```bash
cd untitled
```

2. **Backend Setup**
```bash
cd backend

# Create PostgreSQL database
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE headary_spa_db ENCODING 'UTF8';"

# Install PHP dependencies
composer install

# Run migrations and seeds
php artisan migrate
php artisan db:seed

# Start server
php artisan serve --host=127.0.0.1 --port=8000
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

4. **Access the Application**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:4200/admin/login

### Default Admin Credentials
- **Email**: admin@headary-spa.local
- **Password**: admin123

## 📁 Project Structure

```
untitled/
├── backend/                 # Laravel PHP application
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   └── styles.scss
│   └── package.json
└── SETUP.md               # Detailed setup guide
```

## 🛠️ Technology Stack

### Backend
- **Laravel 12** - PHP Framework
- **PostgreSQL** - Database
- **Laravel Sanctum** - API Authentication
- **PHP 8.2** - Programming Language

### Frontend
- **Angular 18+** - Frontend Framework
- **TypeScript** - Programming Language
- **RxJS** - Reactive Programming
- **SCSS** - Styling
- **Responsive Design** - Mobile-first approach

### Architecture
- **REST API** - Backend API
- **Token-based Auth** - Sanctum Tokens
- **Standalone Components** - Modern Angular
- **MVC Pattern** - Laravel

## 📖 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "admin@headary-spa.local",
  "password": "admin123"
}

# Response
{
  "user": { ... },
  "token": "auth_token_here"
}
```

### Services
```bash
# Get all services
GET /api/services

# Create service (admin)
POST /api/services
{
  "name": "Head Spa",
  "description": "...",
  "price": 89.00,
  "duration_minutes": 60,
  "image_url": "..."
}
```

### Gallery
```bash
# Get all gallery items
GET /api/gallery

# Add gallery item (admin)
POST /api/gallery
{
  "title": "...",
  "image_url": "...",
  "service_id": 1
}
```

## 🎨 Customization

### Theme Colors
Edit `backend/database/seeders/SettingSeeder.php`:
```php
'primary_color' => '#8B6F47',      // Brown
'secondary_color' => '#D4AF37',    // Gold
'accent_color' => '#E8DCC8',       // Beige
```

### Fonts
```php
'font_primary' => 'Nunito, sans-serif',
'font_secondary' => 'Playfair Display, serif',
```

### Site Text
All site text can be customized through the Settings in Admin Panel:
- Hero section title/subtitle
- Contact information
- Business address
- About description

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
# Output: dist/ directory for deployment
```

### Backend
```bash
cd backend
composer install --no-dev
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```

## 📝 Detailed Documentation

See [SETUP.md](./SETUP.md) for:
- Detailed setup instructions
- Database schema
- All API endpoints
- Troubleshooting guide
- Deployment guide

## 👥 Admin Panel Features

### Dashboard
- Service statistics
- Employee overview
- Appointment summary
- Quick navigation

### Services Management
- Create/Edit/Delete services
- Upload service images
- Set pricing and duration
- Manage service order

### Gallery Management
- Upload gallery images
- Organize by service
- Reorder images
- Manage visibility

### Employees
- Add/edit staff profiles
- Upload avatars
- Add specializations
- Manage active status

### Appointments
- View all bookings
- Update status
- Add notes
- Export data

### Settings
- Customize colors
- Change fonts
- Update text content
- Manage business info

## 🔒 Security Features

- ✅ Token-based authentication (Sanctum)
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Route protection with guards
- ✅ HTTP interceptors for auth headers
- ✅ Protected API endpoints

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and create a branch for new features.

## 📧 Contact

For support or inquiries about Headary Spa website:
- Email: admin@headary-spa.local
- Booking: https://timma.no/salong/headary-spa

## 📄 License

This project is private/proprietary. All rights reserved.

---

**Made with ❤️ for Headary Spa**

Last Updated: April 2026


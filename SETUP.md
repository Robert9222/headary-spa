# Headary Spa - Setup Instructions

## Prerequisites
- Node.js >= 18
- PHP >= 8.2
- PostgreSQL >= 14
- npm or yarn
- Composer

## Backend Setup (Laravel PHP)

### 1. Configure PostgreSQL
```bash
# Create database
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE headary_spa_db ENCODING 'UTF8';"
```

### 2. Install Dependencies
```bash
cd backend
composer install
```

### 3. Environment Setup
```bash
# File: backend/.env is already configured with:
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=headary_spa_db
DB_USERNAME=postgres
DB_PASSWORD=  # (empty password)
```

### 4. Run Migrations & Seeds
```bash
php artisan migrate
php artisan db:seed
```

### 5. Start Backend Server
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Backend will be available at: http://localhost:8000

**Admin Login Credentials:**
- Email: admin@headary-spa.local
- Password: admin123

## Frontend Setup (Angular)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

Frontend will be available at: http://localhost:4200

## API Endpoints

### Public Endpoints
- `GET /api/services` - List all active services
- `GET /api/gallery` - List all gallery items
- `GET /api/employees` - List all employees
- `GET /api/settings` - Get all settings
- `POST /api/appointments` - Create appointment booking

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

**Services Management (POST/PUT/DELETE)**
- `POST /api/services` - Create service
- `PUT /api/services/{id}` - Update service
- `DELETE /api/services/{id}` - Delete service

**Gallery Management (POST/PUT/DELETE)**
- `POST /api/gallery` - Add gallery item
- `PUT /api/gallery/{id}` - Update gallery item
- `DELETE /api/gallery/{id}` - Delete gallery item

**Employees Management**
- `POST /api/employees` - Create employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

**Settings Management**
- `POST /api/settings` - Create setting
- `PUT /api/settings/{key}` - Update setting
- `DELETE /api/settings/{key}` - Delete setting

## Features

### Public Pages
1. **Home** - Hero section with featured services and gallery preview
2. **Services** - Detailed list of all services with descriptions and pricing
3. **Gallery** - Full gallery with lightbox viewer

### Admin Panel
1. **Login** - Secure authentication with Sanctum tokens
2. **Dashboard** - Overview of services, gallery, employees, appointments
3. **Services Management** - CRUD operations for services
4. **Gallery Management** - Upload and manage gallery images
5. **Employees Management** - Manage staff information
6. **Appointments** - View and manage bookings
7. **Settings** - Customize theme colors, fonts, and text

### Booking Integration
- External booking link to Timma (https://timma.no/salong/headary-spa)
- Button in header and CTA buttons throughout the site

## Database Schema

### Tables
- **users** - Admin users
- **services** - Spa services with pricing and duration
- **gallery** - Gallery images
- **employees** - Staff information
- **clients** - Client bookings
- **appointments** - Appointment records
- **packages** - Service packages
- **settings** - Site configuration

## Customization

### Theme Colors
Edit `SettingSeeder.php` to change default colors:
```php
'primary_color' => '#8B6F47',
'secondary_color' => '#D4AF37',
'accent_color' => '#E8DCC8',
```

### Fonts
Update in `SettingSeeder.php`:
```php
'font_primary' => 'Nunito, sans-serif',
'font_secondary' => 'Playfair Display, serif',
```

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL service is running
- Check credentials in `backend/.env`
- Verify database exists: `psql -U postgres -c "\l"`

### CORS Errors
- Check `config/cors.php` for allowed origins
- Ensure frontend URL is whitelisted (default: http://localhost:4200)

### Laravel Errors
- Clear cache: `php artisan cache:clear`
- Regenerate key: `php artisan key:generate`
- Check logs: `tail -f storage/logs/laravel.log`

### Angular Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`

## Deployment

### Production Build (Frontend)
```bash
cd frontend
npm run build
```
Output will be in `dist/` directory.

### Production Setup (Backend)
```bash
cd backend
composer install --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Support

For issues or questions, please check:
1. Laravel Documentation: https://laravel.com/docs
2. Angular Documentation: https://angular.dev
3. PostgreSQL Documentation: https://www.postgresql.org/docs


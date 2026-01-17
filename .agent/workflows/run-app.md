---
description: How to run the Rayova application (backend and frontend)
---

# Running Rayova Application

This workflow describes how to run the complete Rayova application with both the Laravel backend and React frontend.

## Prerequisites

1. MySQL server running (via XAMPP)
2. PHP 8.2+ installed
3. Node.js 18+ installed
4. Composer installed

## Steps

### 1. Start MySQL (if not running)
Start XAMPP and ensure MySQL is running.

### 2. Start the Laravel Backend

**Important:** You must be inside the `rayova` folder to run backend commands.

```bash
cd c:\xampp\htdocs\rayova-luxury-fragrance-main\rayova
php artisan serve
```

This will start the backend at `http://127.0.0.1:8000` (or `http://localhost:8000`)

### 3. Start the React Frontend (in a new terminal)

**Important:** You must be in the root directory for frontend commands.

```bash
cd c:\xampp\htdocs\rayova-luxury-fragrance-main
npm run dev
```

This will start the frontend at `http://localhost:5173`

## Default Admin Credentials

- **Email:** admin@rayova.ma
- **Password:** Admin@123

## API Endpoints

The Laravel API is available at `http://localhost:8000/api`

### Public Endpoints
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `POST /api/login` - Login
- `POST /api/register` - Register

### Admin Endpoints (require authentication)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- etc.

## Troubleshooting

### Database Connection Error
1. Ensure MySQL is running in XAMPP
2. Check `.env` file in `rayova` folder for correct database credentials

### CORS Error
1. Check that the frontend URL is in `config/cors.php`
2. Ensure both servers are running

### 401 Unauthorized
1. Check that the auth token is being sent in requests
2. Try logging in again to get a fresh token

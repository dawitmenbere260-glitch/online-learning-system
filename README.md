# Learning Management System

A full-stack Learning Management System built with Laravel (backend) and Next.js (frontend).

## Features

- User authentication (Student, Instructor, Admin roles)
- Course management
- Lesson tracking and progress
- Quizzes and assignments
- Material uploads
- Student enrollment
- Admin dashboard

## Tech Stack

**Backend:**
- Laravel 11
- SQLite database
- Laravel Sanctum for authentication

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
copy .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Run migrations and seeders:
```bash
php artisan migrate --seed
```

6. Start the server:
```bash
php artisan serve
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
copy .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Credentials

**Admin:**
- Email: admin@example.com
- Password: admin123

**Instructor:**
- Email: instructor@example.com
- Password: password

**Student:**
- Email: student@example.com
- Password: password

## Running Both Services

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

## Project Structure

```
.
├── backend/          # Laravel backend
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── ...
└── README.md
```

## License

MIT

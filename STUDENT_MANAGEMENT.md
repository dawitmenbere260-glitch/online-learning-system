# Student Management Feature

## Overview
Added comprehensive student management functionality to the admin panel, allowing administrators to manage all users (students, instructors, and admins).

## Features

### Backend (Laravel)

1. **UserController** (`backend/app/Http/Controllers/Api/UserController.php`)
   - List users with filtering (role, status, search)
   - View individual user details
   - Create new users
   - Update user information
   - Delete users
   - Block/unblock users

2. **Database Migration**
   - Added `blocked_at` column to users table
   - Tracks when a user was blocked

3. **Middleware**
   - `CheckBlocked` middleware prevents blocked users from accessing protected routes
   - Applied to all authenticated routes

4. **API Endpoints** (Admin only)
   - `GET /api/admin/users` - List all users with filters
   - `GET /api/admin/users/{id}` - Get user details
   - `POST /api/admin/users` - Create new user
   - `PUT /api/admin/users/{id}` - Update user
   - `DELETE /api/admin/users/{id}` - Delete user
   - `POST /api/admin/users/{id}/block` - Block user
   - `POST /api/admin/users/{id}/unblock` - Unblock user

### Frontend (Next.js)

1. **Student Management Page** (`frontend/src/app/admin/students/page.tsx`)
   - Searchable user table
   - Filter by role (student, instructor, admin)
   - Filter by status (active, blocked)
   - Add/Edit user modal
   - Block/Unblock functionality
   - Delete users
   - Shows enrollment count per user

2. **API Integration** (`frontend/src/lib/api.ts`)
   - Added `adminAPI` with all user management methods

## Usage

### Access the Student Management Page
1. Login as an admin
2. Navigate to `/admin/students`
3. Or click "Manage Students" from the admin dashboard

### Add a New User
1. Click "Add User" button
2. Fill in the form (name, email, password, role, bio)
3. Click "Create"

### Edit a User
1. Click "Edit" next to the user
2. Modify the fields (password is optional)
3. Click "Update"

### Block/Unblock a User
1. Click "Block" to prevent user access
2. Click "Unblock" to restore access
3. Blocked users cannot login or access protected routes

### Delete a User
1. Click "Delete" next to the user
2. Confirm the deletion
3. Note: Cannot delete your own account

## Security Features

- Admin-only access to user management endpoints
- Blocked users cannot login
- Blocked users are logged out immediately (tokens revoked)
- Cannot block or delete your own account
- Password hashing for new/updated passwords
- Email uniqueness validation

## Database Changes

Run the migration to add the `blocked_at` column:
```bash
cd backend
php artisan migrate
```

## Testing

Test the endpoints using the admin account:
1. Create a test user
2. Edit the user details
3. Block the user and try to login with their credentials
4. Unblock and verify they can login again
5. Delete the test user

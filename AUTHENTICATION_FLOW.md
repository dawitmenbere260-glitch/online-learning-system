# Authentication Flow - Fixed

## Registration

### Available Roles
- **Student** - Default role for learners
- **Instructor** - For course creators and teachers
- ~~Admin~~ - Removed from public registration (admins can only be created by other admins)

### Registration Redirects
After successful registration, users are redirected based on their role:

- **Student** → `/dashboard` - Student dashboard with enrolled courses
- **Instructor** → `/instructor` - Instructor dashboard to manage courses
- **Admin** → `/admin` - Admin panel (only if created by another admin)

## Login

### Login Redirects
After successful login, users are redirected based on their role:

- **Student** → `/dashboard` - Student dashboard
- **Instructor** → `/instructor` - Instructor dashboard
- **Admin** → `/admin` - Admin panel

## Navigation

The navbar dynamically shows links based on user role:

### All Users (Logged In)
- Courses
- Dashboard
- Logout

### Instructors (Additional)
- Instructor (link to instructor dashboard)

### Admins (Additional)
- Admin Panel (link to admin dashboard)

## Creating Admin Users

Admins cannot register through the public registration form. They must be created by:

1. **Existing Admin** - Through the admin panel at `/admin/students`
2. **Database Script** - Run `php backend/create_admin.php`
3. **Direct Database** - Update user role: `UPDATE users SET role = 'admin' WHERE email = 'user@example.com';`

## Default Admin Account

- **Email:** admin@example.com
- **Password:** admin123

## User Roles Summary

| Role | Registration | Dashboard | Can Create Courses | Can Manage Users | Can Grade |
|------|-------------|-----------|-------------------|-----------------|-----------|
| Student | ✅ Public | `/dashboard` | ❌ | ❌ | ❌ |
| Instructor | ✅ Public | `/instructor` | ✅ | ❌ | ✅ |
| Admin | ❌ Admin Only | `/admin` | ✅ | ✅ | ✅ |

## Security Features

- ✅ Blocked users cannot login
- ✅ Role-based access control
- ✅ Protected routes with middleware
- ✅ Admin-only user management
- ✅ Instructor-only course management
- ✅ Enrollment verification for course access

## Testing the Flow

### Test Student Registration
1. Go to `/register`
2. Fill in details and select "Student"
3. Submit → Should redirect to `/dashboard`

### Test Instructor Registration
1. Go to `/register`
2. Fill in details and select "Instructor"
3. Submit → Should redirect to `/instructor`

### Test Admin Login
1. Go to `/login`
2. Login with: admin@example.com / admin123
3. Submit → Should redirect to `/admin`
4. Should see "Admin Panel" link in navbar

## Troubleshooting

### Admin link not showing in navbar
- Make sure you're logged in as an admin
- Check your role is displayed next to your name in navbar
- Clear browser cache and localStorage
- Re-login

### Wrong redirect after login/register
- Clear browser localStorage
- Check user role in database
- Verify token is being saved correctly

### Cannot access admin panel
- Verify user role is 'admin' in database
- Check if user is blocked
- Ensure you're logged in

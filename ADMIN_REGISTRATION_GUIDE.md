# Admin Registration Guide

## Method 1: Using the create_admin.php Script (EASIEST)

Run this command from your project root:

```bash
php backend/create_admin.php
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

This script will:
- Create a new admin user if it doesn't exist
- Update an existing user to admin role if the email already exists
- Show all users and their roles

---

## Method 2: Using Laravel Tinker (Interactive Shell)

1. Navigate to the backend folder:
```bash
cd backend
```

2. Open Laravel Tinker:
```bash
php artisan tinker
```

3. Create an admin user:
```php
$admin = new App\Models\User();
$admin->name = 'Admin Name';
$admin->email = 'admin@yourdomain.com';
$admin->password = bcrypt('your-secure-password');
$admin->role = 'admin';
$admin->save();
```

4. Exit Tinker:
```php
exit
```

---

## Method 3: Direct Database Update (Convert Existing User)

If you already have a user account and want to make it an admin:

### Using SQLite Command Line:
```bash
cd backend
sqlite3 database/database.sqlite
```

Then run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
.exit
```

### Using a Database GUI Tool:
1. Open `backend/database/database.sqlite` in a SQLite browser
2. Find the users table
3. Update the `role` column to `'admin'` for your user
4. Save changes

---

## Method 4: Create Custom Admin Registration Script

Create a new file `backend/register_admin.php`:

```php
<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Get input from command line
echo "Enter admin name: ";
$name = trim(fgets(STDIN));

echo "Enter admin email: ";
$email = trim(fgets(STDIN));

echo "Enter admin password: ";
$password = trim(fgets(STDIN));

// Check if user exists
if (User::where('email', $email)->exists()) {
    echo "Error: User with this email already exists!\n";
    exit(1);
}

// Create admin user
$admin = User::create([
    'name' => $name,
    'email' => $email,
    'password' => Hash::make($password),
    'role' => 'admin',
]);

echo "\n✓ Admin user created successfully!\n";
echo "Email: {$admin->email}\n";
echo "Role: {$admin->role}\n";
echo "\nYou can now login at: http://localhost:3000/login\n";
```

Run it with:
```bash
php backend/register_admin.php
```

---

## Method 5: Using API with Modified Registration (NOT RECOMMENDED)

**Note:** The public registration endpoint doesn't allow admin registration for security reasons. You would need to temporarily modify the code, which is not recommended for production.

---

## Verifying Admin Access

After creating an admin user:

1. **Login** at `http://localhost:3000/login`
2. Use the admin credentials
3. You should see:
   - "Admin Panel" link in the navbar (in bold)
   - Your role displayed as "admin" next to your username
4. Click "Admin Panel" to access the admin dashboard

---

## Admin Capabilities

Once logged in as admin, you can:
- ✅ Manage all users (view, edit, delete, block/unblock)
- ✅ Manage all courses (view, edit, delete, change status)
- ✅ View platform statistics
- ✅ Access all instructor features
- ✅ View reports
- ✅ Configure platform settings

---

## Security Notes

⚠️ **Important:**
- Change the default admin password immediately after first login
- Never commit `.env` file with admin credentials
- Use strong passwords for admin accounts
- Limit the number of admin users
- Regularly audit admin access logs

---

## Troubleshooting

### "Admin Panel" link not showing?
- Clear browser cache and refresh
- Check localStorage for correct user data
- Verify the user's role is 'admin' in the database

### Can't login with admin credentials?
- Verify the user exists: `php backend/check_users.php`
- Check the password is hashed correctly
- Ensure the database is not locked

### Getting "Unauthorized" errors?
- Check that the `AdminMiddleware.php` is working
- Verify the auth token is valid
- Check browser console for errors

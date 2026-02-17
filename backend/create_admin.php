<?php

// Quick script to create an admin user or update existing user to admin
// Run this file: php backend/create_admin.php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Admin User Creator ===\n\n";

// Option 1: Create new admin
echo "Option 1: Create new admin user\n";
echo "Email: admin@example.com\n";
echo "Password: admin123\n\n";

$admin = User::where('email', 'admin@example.com')->first();

if ($admin) {
    echo "Admin user already exists!\n";
    echo "Updating role to admin...\n";
    $admin->update(['role' => 'admin']);
    echo "✓ User updated to admin role\n\n";
} else {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => Hash::make('admin123'),
        'role' => 'admin',
    ]);
    echo "✓ Admin user created successfully!\n\n";
}

// Option 2: List all users and their roles
echo "=== All Users ===\n";
$users = User::all();
foreach ($users as $user) {
    echo "ID: {$user->id} | Email: {$user->email} | Name: {$user->name} | Role: {$user->role}\n";
}

echo "\n=== Instructions ===\n";
echo "1. Login with: admin@example.com / admin123\n";
echo "2. You should see 'Admin Panel' link in the navbar\n";
echo "3. Click it to access the admin dashboard\n";
echo "\nTo make any existing user an admin, update their role in the database:\n";
echo "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';\n";

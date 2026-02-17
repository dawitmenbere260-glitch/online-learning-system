<?php

/**
 * Reset user password
 * Run this script: php reset_password.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Get email from command line argument or prompt
if (isset($argv[1])) {
    $email = $argv[1];
} else {
    echo "Enter email address: ";
    $email = trim(fgets(STDIN));
}

// Find user
$user = User::where('email', $email)->first();

if (!$user) {
    echo "Error: User with email '{$email}' not found!\n";
    exit(1);
}

// Get new password
if (isset($argv[2])) {
    $newPassword = $argv[2];
} else {
    echo "Enter new password: ";
    $newPassword = trim(fgets(STDIN));
}

// Update password
$user->password = Hash::make($newPassword);
$user->save();

echo "\n✓ Password reset successfully!\n";
echo "Email: {$user->email}\n";
echo "Name: {$user->name}\n";
echo "Role: {$user->role}\n";
echo "\nYou can now login at: http://localhost:3000/login\n";

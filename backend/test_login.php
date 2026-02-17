<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Test password verification
$user = User::where('email', 'admin@example.com')->first();

if ($user) {
    echo "User found: {$user->email}\n";
    echo "Stored password hash: {$user->password}\n";
    
    $testPassword = 'password';
    $isValid = Hash::check($testPassword, $user->password);
    
    echo "Password 'password' is " . ($isValid ? "VALID" : "INVALID") . "\n";
    
    // Test with different password
    $isValid2 = Hash::check('wrongpassword', $user->password);
    echo "Password 'wrongpassword' is " . ($isValid2 ? "VALID" : "INVALID") . "\n";
} else {
    echo "User not found!\n";
}
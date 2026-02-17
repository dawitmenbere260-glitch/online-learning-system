<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\User::all(['email', 'role']);

echo "Users in database:\n";
foreach ($users as $user) {
    echo "- {$user->email} ({$user->role})\n";
}

echo "\nTotal users: " . $users->count() . "\n";
<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\User::all(['name', 'email', 'role']);

echo "Users with names:\n";
foreach ($users as $user) {
    echo "- {$user->name} ({$user->email}) - {$user->role}\n";
}
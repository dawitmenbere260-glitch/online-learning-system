<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking User Roles...\n\n";

// Get all users
$users = App\Models\User::all();

echo "📋 All Users in Database:\n";
echo str_repeat("-", 80) . "\n";
printf("%-5s %-25s %-30s %-15s %-10s\n", "ID", "Name", "Email", "Role", "Blocked");
echo str_repeat("-", 80) . "\n";

foreach ($users as $user) {
    printf(
        "%-5s %-25s %-30s %-15s %-10s\n",
        $user->id,
        substr($user->name, 0, 25),
        substr($user->email, 0, 30),
        $user->role,
        $user->isBlocked() ? 'Yes' : 'No'
    );
}

echo str_repeat("-", 80) . "\n";

// Count by role
$studentCount = App\Models\User::where('role', 'student')->count();
$instructorCount = App\Models\User::where('role', 'instructor')->count();
$adminCount = App\Models\User::where('role', 'admin')->count();

echo "\n📊 Summary:\n";
echo "   Students: {$studentCount}\n";
echo "   Instructors: {$instructorCount}\n";
echo "   Admins: {$adminCount}\n";
echo "   Total: " . $users->count() . "\n";

// Check if there's a specific user you're trying to use
echo "\n🔍 Looking for potential issues...\n";

$instructors = App\Models\User::where('role', 'instructor')->get();
if ($instructors->isEmpty()) {
    echo "   ⚠️  No instructors found in database!\n";
} else {
    echo "   ✅ Found {$instructors->count()} instructor(s)\n";
    foreach ($instructors as $instructor) {
        $courseCount = App\Models\Course::where('instructor_id', $instructor->id)->count();
        echo "      - {$instructor->name} ({$instructor->email}) - {$courseCount} courses\n";
    }
}

echo "\n💡 To fix role issues:\n";
echo "   1. Update user role in database:\n";
echo "      php artisan tinker\n";
echo "      User::where('email', 'your@email.com')->update(['role' => 'instructor']);\n";
echo "\n   2. Or create a new instructor:\n";
echo "      User::create(['name' => 'Instructor Name', 'email' => 'instructor@test.com', 'password' => bcrypt('password'), 'role' => 'instructor']);\n";

echo "\n✅ Check completed!\n";
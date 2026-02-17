<?php

/**
 * Check instructor courses
 * Usage: php check_instructor_courses.php [email]
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Course;

// Get email from command line or prompt
if (isset($argv[1])) {
    $email = $argv[1];
} else {
    echo "Enter instructor email: ";
    $email = trim(fgets(STDIN));
}

$user = User::where('email', $email)->first();

if (!$user) {
    echo "User not found!\n";
    exit(1);
}

echo "User: {$user->name} ({$user->email})\n";
echo "Role: {$user->role}\n";
echo "User ID: {$user->id}\n\n";

if ($user->role !== 'instructor' && $user->role !== 'admin') {
    echo "This user is not an instructor!\n";
    exit(0);
}

$courses = Course::where('instructor_id', $user->id)->get();

echo "Courses created by this instructor: {$courses->count()}\n\n";

foreach ($courses as $course) {
    echo "- {$course->title}\n";
    echo "  ID: {$course->id}\n";
    echo "  Status: {$course->status}\n";
    echo "  Enrollments: " . $course->enrollments()->count() . "\n";
    echo "  Lessons: " . $course->lessons()->count() . "\n\n";
}

if ($courses->count() === 0) {
    echo "This instructor has not created any courses yet.\n";
    echo "They can create courses from the instructor dashboard.\n";
}

<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Instructor Courses...\n\n";

// Find an instructor
$instructor = App\Models\User::where('role', 'instructor')->first();

if (!$instructor) {
    echo "❌ No instructor found in database\n";
    echo "Creating a test instructor...\n";
    
    $instructor = App\Models\User::create([
        'name' => 'Test Instructor',
        'email' => 'instructor@test.com',
        'password' => bcrypt('password'),
        'role' => 'instructor',
    ]);
    
    echo "✅ Created test instructor: {$instructor->name}\n";
}

echo "📋 Instructor: {$instructor->name} (ID: {$instructor->id})\n\n";

// Check courses for this instructor
$courses = App\Models\Course::where('instructor_id', $instructor->id)->get();

echo "📚 Courses for instructor:\n";
echo "   Total courses: {$courses->count()}\n";

if ($courses->count() > 0) {
    foreach ($courses as $course) {
        echo "   - {$course->title} (Status: {$course->status}, ID: {$course->id})\n";
    }
} else {
    echo "   No courses found. Creating a test course...\n";
    
    $course = App\Models\Course::create([
        'title' => 'Test Course',
        'description' => 'This is a test course',
        'level' => 'beginner',
        'duration_hours' => 5,
        'instructor_id' => $instructor->id,
        'status' => 'draft', // This should be the default
    ]);
    
    echo "   ✅ Created test course: {$course->title} (Status: {$course->status})\n";
}

echo "\n🔍 Testing API endpoint simulation...\n";

// Simulate the instructor courses API call
$query = App\Models\Course::where('instructor_id', $instructor->id)
    ->with(['lessons', 'enrollments'])
    ->withCount(['enrollments', 'lessons', 'assignments', 'quizzes']);

$instructorCourses = $query->orderBy('created_at', 'desc')->get();

echo "   API would return {$instructorCourses->count()} courses\n";

foreach ($instructorCourses as $course) {
    echo "   - {$course->title}\n";
    echo "     Status: {$course->status}\n";
    echo "     Lessons: {$course->lessons_count}\n";
    echo "     Enrollments: {$course->enrollments_count}\n";
    echo "     Created: {$course->created_at}\n\n";
}

echo "✅ Test completed!\n";
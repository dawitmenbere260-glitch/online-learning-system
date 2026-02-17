<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$courses = App\Models\Course::with(['instructor', 'lessons'])->get();

echo "Courses and their content:\n\n";

foreach ($courses as $course) {
    echo "=== {$course->title} ===\n";
    echo "Instructor: {$course->instructor->name}\n";
    echo "Description: {$course->description}\n";
    echo "Price: \${$course->price}\n";
    echo "Level: {$course->level}\n";
    echo "Lessons:\n";
    
    foreach ($course->lessons as $lesson) {
        $freeText = $lesson->is_free ? " (Free)" : "";
        echo "  {$lesson->order}. {$lesson->title}{$freeText}\n";
        echo "     {$lesson->description} - {$lesson->duration_minutes} min\n";
    }
    echo "\n";
}
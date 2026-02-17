<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample users
        $instructor1 = User::create([
            'name' => 'Million Sime',
            'email' => 'instructor@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'bio' => 'Experienced web developer with 10+ years in the industry.',
        ]);

        $instructor2 = User::create([
            'name' => 'Mohammad M',
            'email' => 'sarah@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'bio' => 'Full-stack developer and coding bootcamp instructor.',
        ]);

        $instructor3 = User::create([
            'name' => 'Tadele Sh',
            'email' => 'tadele@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'bio' => 'Mobile app developer and UI/UX specialist.',
        ]);

        $instructor4 = User::create([
            'name' => 'Shume',
            'email' => 'shume@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'bio' => 'Data science and machine learning expert.',
        ]);

        $student1 = User::create([
            'name' => 'Mike Wilson',
            'email' => 'student@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $student2 = User::create([
            'name' => 'Emily Davis',
            'email' => 'emily@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'bio' => 'System administrator with full access to manage the platform.',
        ]);

        // Create sample courses
        $course1 = Course::create([
            'title' => 'web development',
            'description' => 'Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive web development course. Perfect for beginners who want to become full-stack developers.',
            'price' => 99.99,
            'level' => 'beginner',
            'status' => 'published',
            'instructor_id' => $instructor1->id,
            'duration_hours' => 40,
        ]);

        $course2 = Course::create([
            'title' => 'java programming',
            'description' => 'Master Java programming from fundamentals to advanced concepts. Learn object-oriented programming, data structures, algorithms, and enterprise Java development with Spring Framework.',
            'price' => 149.99,
            'level' => 'beginner',
            'status' => 'published',
            'instructor_id' => $instructor2->id,
            'duration_hours' => 25,
        ]);

        $course3 = Course::create([
            'title' => 'software enginering',
            'description' => 'This course introduces students to the principles and practices of software engineering used to design, develop, test, and maintain high-quality software systems. Students will learn how software is built in a systematic and organized way, from understanding user requirements to deployment and maintenance.',
            'price' => 79.99,
            'level' => 'intermediate',
            'status' => 'published',
            'instructor_id' => $instructor3->id,
            'duration_hours' => 30,
        ]);

        $course4 = Course::create([
            'title' => 'AI',
            'description' => 'This course introduces students to the fundamental concepts of Artificial Intelligence (AI) and how intelligent systems are designed and built. Students will learn how machines can simulate human intelligence such as learning, reasoning, problem-solving, and decision-making.',
            'price' => 129.99,
            'level' => 'intermediate',
            'status' => 'published',
            'instructor_id' => $instructor4->id,
            'duration_hours' => 35,
        ]);

        // Create sample lessons for course 1
        $lessons1 = [
            ['title' => 'Introduction to Web Development', 'description' => 'Overview of web development and course structure', 'duration_minutes' => 15, 'is_free' => true, 'order' => 1],
            ['title' => 'HTML Fundamentals', 'description' => 'Learn the basics of HTML markup', 'duration_minutes' => 45, 'is_free' => true, 'order' => 2],
            ['title' => 'CSS Styling Basics', 'description' => 'Introduction to CSS and styling web pages', 'duration_minutes' => 60, 'is_free' => false, 'order' => 3],
            ['title' => 'JavaScript Fundamentals', 'description' => 'Learn JavaScript programming basics', 'duration_minutes' => 90, 'is_free' => false, 'order' => 4],
            ['title' => 'DOM Manipulation', 'description' => 'Working with the Document Object Model', 'duration_minutes' => 75, 'is_free' => false, 'order' => 5],
        ];

        foreach ($lessons1 as $lessonData) {
            Lesson::create(array_merge($lessonData, [
                'course_id' => $course1->id,
                'content' => 'This is the lesson content for ' . $lessonData['title'],
                'video_url' => 'https://example.com/video/' . str_replace(' ', '-', strtolower($lessonData['title'])),
            ]));
        }

        // Create sample lessons for course 2 (Java Programming)
        $lessons2 = [
            ['title' => 'Java Fundamentals', 'description' => 'Introduction to Java syntax, variables, and data types', 'duration_minutes' => 60, 'is_free' => true, 'order' => 1],
            ['title' => 'Object-Oriented Programming', 'description' => 'Classes, objects, inheritance, and polymorphism in Java', 'duration_minutes' => 90, 'is_free' => false, 'order' => 2],
            ['title' => 'Java Collections Framework', 'description' => 'Working with Lists, Sets, Maps, and other collections', 'duration_minutes' => 75, 'is_free' => false, 'order' => 3],
            ['title' => 'Exception Handling', 'description' => 'Try-catch blocks, custom exceptions, and error handling', 'duration_minutes' => 45, 'is_free' => false, 'order' => 4],
            ['title' => 'Java Streams and Lambda', 'description' => 'Functional programming with streams and lambda expressions', 'duration_minutes' => 80, 'is_free' => false, 'order' => 5],
        ];

        foreach ($lessons2 as $lessonData) {
            Lesson::create(array_merge($lessonData, [
                'course_id' => $course2->id,
                'content' => 'This is the lesson content for ' . $lessonData['title'],
                'video_url' => 'https://example.com/video/' . str_replace(' ', '-', strtolower($lessonData['title'])),
            ]));
        }

        // Create sample lessons for course 3 (Software Engineering)
        $lessons3 = [
            ['title' => 'Introduction to Software Engineering', 'description' => 'Software development lifecycle and methodologies', 'duration_minutes' => 45, 'is_free' => true, 'order' => 1],
            ['title' => 'Requirements Analysis', 'description' => 'Gathering and analyzing software requirements', 'duration_minutes' => 60, 'is_free' => false, 'order' => 2],
            ['title' => 'System Design and Architecture', 'description' => 'Designing scalable and maintainable software systems', 'duration_minutes' => 90, 'is_free' => false, 'order' => 3],
            ['title' => 'Testing and Quality Assurance', 'description' => 'Software testing strategies and quality control', 'duration_minutes' => 75, 'is_free' => false, 'order' => 4],
            ['title' => 'Project Management', 'description' => 'Agile methodologies and project planning', 'duration_minutes' => 50, 'is_free' => false, 'order' => 5],
        ];

        foreach ($lessons3 as $lessonData) {
            Lesson::create(array_merge($lessonData, [
                'course_id' => $course3->id,
                'content' => 'This is the lesson content for ' . $lessonData['title'],
                'video_url' => 'https://example.com/video/' . str_replace(' ', '-', strtolower($lessonData['title'])),
            ]));
        }

        // Create sample lessons for course 4 (AI)
        $lessons4 = [
            ['title' => 'Introduction to Artificial Intelligence', 'description' => 'Overview of AI concepts and applications', 'duration_minutes' => 50, 'is_free' => true, 'order' => 1],
            ['title' => 'Machine Learning Fundamentals', 'description' => 'Supervised and unsupervised learning algorithms', 'duration_minutes' => 90, 'is_free' => false, 'order' => 2],
            ['title' => 'Neural Networks and Deep Learning', 'description' => 'Building and training neural networks', 'duration_minutes' => 120, 'is_free' => false, 'order' => 3],
            ['title' => 'Natural Language Processing', 'description' => 'Text processing and language understanding', 'duration_minutes' => 85, 'is_free' => false, 'order' => 4],
            ['title' => 'Computer Vision', 'description' => 'Image recognition and processing techniques', 'duration_minutes' => 95, 'is_free' => false, 'order' => 5],
        ];

        foreach ($lessons4 as $lessonData) {
            Lesson::create(array_merge($lessonData, [
                'course_id' => $course4->id,
                'content' => 'This is the lesson content for ' . $lessonData['title'],
                'video_url' => 'https://example.com/video/' . str_replace(' ', '-', strtolower($lessonData['title'])),
            ]));
        }

        // Create sample enrollments (all starting at 0% progress)
        Enrollment::create([
            'user_id' => $student1->id,
            'course_id' => $course1->id,
            'progress' => 0,
        ]);

        Enrollment::create([
            'user_id' => $student1->id,
            'course_id' => $course3->id,
            'progress' => 0,
        ]);

        Enrollment::create([
            'user_id' => $student2->id,
            'course_id' => $course1->id,
            'progress' => 0,
        ]);

        Enrollment::create([
            'user_id' => $student2->id,
            'course_id' => $course2->id,
            'progress' => 0,
        ]);
    }
}
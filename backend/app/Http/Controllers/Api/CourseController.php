<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['instructor', 'lessons'])
            ->published()
            ->withCount('enrollments');

        if ($request->has('level')) {
            $query->byLevel($request->level);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $courses = $query->paginate(12);

        return response()->json($courses);
    }

    public function show(Course $course)
    {
        $course->load(['instructor', 'lessons' => function($query) {
            $query->ordered();
        }]);

        // Check if user is enrolled
        $isEnrolled = false;
        $enrollment = null;
        
        if (auth()->check()) {
            $enrollment = Enrollment::where('user_id', auth()->id())
                ->where('course_id', $course->id)
                ->first();
            $isEnrolled = !is_null($enrollment);
        }

        return response()->json([
            'course' => $course,
            'is_enrolled' => $isEnrolled,
            'enrollment' => $enrollment,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user is instructor or admin
        if (!auth()->user()->isInstructor() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Only instructors can create courses.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'sometimes|numeric|min:0',
            'level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer|min:1',
        ]);

        $course = Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price ?? 0, // Default to 0 (free)
            'level' => $request->level,
            'duration_hours' => $request->duration_hours,
            'instructor_id' => auth()->id(),
        ]);

        return response()->json($course, 201);
    }

    public function update(Request $request, Course $course)
    {
        // Check if user is the course instructor or admin
        if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only update your own courses.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'level' => 'sometimes|in:beginner,intermediate,advanced',
            'status' => 'sometimes|in:draft,published,archived',
            'duration_hours' => 'sometimes|integer|min:1',
        ]);

        $course->update($request->only([
            'title', 'description', 'price', 'level', 'status', 'duration_hours'
        ]));

        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        // Check if user is the course instructor or admin
        if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own courses.'], 403);
        }
        
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }

    public function enroll(Request $request, Course $course)
    {
        $user = auth()->user();

        // Check if already enrolled
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existingEnrollment) {
            return response()->json(['message' => 'Already enrolled in this course'], 400);
        }

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'progress' => 0, // Explicitly set progress to 0
        ]);

        return response()->json([
            'message' => 'Successfully enrolled in course',
            'enrollment' => $enrollment,
        ], 201);
    }
}
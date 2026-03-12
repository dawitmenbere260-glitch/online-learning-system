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

    // Instructor dashboard stats
    public function instructorDashboard()
    {
        if (!auth()->user()->isInstructor() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Instructor access required.'], 403);
        }

        $instructorId = auth()->id();
        
        $stats = [
            'total_courses' => Course::where('instructor_id', $instructorId)->count(),
            'published_courses' => Course::where('instructor_id', $instructorId)->where('status', 'published')->count(),
            'draft_courses' => Course::where('instructor_id', $instructorId)->where('status', 'draft')->count(),
            'total_students' => \App\Models\Enrollment::whereHas('course', function($query) use ($instructorId) {
                $query->where('instructor_id', $instructorId);
            })->distinct('user_id')->count(),
            'total_lessons' => \App\Models\Lesson::whereHas('course', function($query) use ($instructorId) {
                $query->where('instructor_id', $instructorId);
            })->count(),
            'total_assignments' => \App\Models\Assignment::whereHas('course', function($query) use ($instructorId) {
                $query->where('instructor_id', $instructorId);
            })->count(),
            'total_quizzes' => \App\Models\Quiz::whereHas('course', function($query) use ($instructorId) {
                $query->where('instructor_id', $instructorId);
            })->count(),
            'pending_submissions' => \App\Models\AssignmentSubmission::whereHas('assignment.course', function($query) use ($instructorId) {
                $query->where('instructor_id', $instructorId);
            })->where('status', 'submitted')->count(),
        ];

        return response()->json($stats);
    }

    // Get instructor's courses
    public function instructorCourses(Request $request)
    {
        if (!auth()->user()->isInstructor() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Instructor access required.'], 403);
        }

        $query = Course::where('instructor_id', auth()->id())
            ->with(['lessons', 'enrollments'])
            ->withCount(['enrollments', 'lessons', 'assignments', 'quizzes']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $courses = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($courses);
    }

    // Get students enrolled in instructor's course
    public function courseStudents(Course $course)
    {
        if ($course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only view students from your own courses.'], 403);
        }

        $students = $course->enrollments()
            ->with(['user', 'course'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'user' => $enrollment->user,
                    'progress' => $enrollment->progress,
                    'enrolled_at' => $enrollment->created_at,
                    'completed_at' => $enrollment->completed_at,
                    'is_completed' => $enrollment->isCompleted(),
                ];
            });

        return response()->json($students);
    }

    // Get recent activity for instructor
    public function recentActivity()
    {
        $instructorId = auth()->id();
        
        // Recent enrollments
        $recentEnrollments = \App\Models\Enrollment::whereHas('course', function($query) use ($instructorId) {
            $query->where('instructor_id', $instructorId);
        })
        ->with(['user', 'course'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function($enrollment) {
            return [
                'type' => 'enrollment',
                'message' => $enrollment->user->name . ' enrolled in ' . $enrollment->course->title,
                'created_at' => $enrollment->created_at,
                'user' => $enrollment->user,
                'course' => $enrollment->course,
            ];
        });

        // Recent submissions
        $recentSubmissions = \App\Models\AssignmentSubmission::whereHas('assignment.course', function($query) use ($instructorId) {
            $query->where('instructor_id', $instructorId);
        })
        ->with(['user', 'assignment.course'])
        ->where('status', 'submitted')
        ->orderBy('submitted_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function($submission) {
            return [
                'type' => 'submission',
                'message' => $submission->user->name . ' submitted ' . $submission->assignment->title,
                'created_at' => $submission->submitted_at,
                'user' => $submission->user,
                'course' => $submission->assignment->course,
                'assignment' => $submission->assignment,
            ];
        });

        // Recent quiz attempts
        $recentQuizAttempts = \App\Models\QuizAttempt::whereHas('quiz.course', function($query) use ($instructorId) {
            $query->where('instructor_id', $instructorId);
        })
        ->with(['user', 'quiz.course'])
        ->whereNotNull('completed_at')
        ->orderBy('completed_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function($attempt) {
            return [
                'type' => 'quiz_attempt',
                'message' => $attempt->user->name . ' completed ' . $attempt->quiz->title . ' (' . ($attempt->passed ? 'Passed' : 'Failed') . ')',
                'created_at' => $attempt->completed_at,
                'user' => $attempt->user,
                'course' => $attempt->quiz->course,
                'quiz' => $attempt->quiz,
                'passed' => $attempt->passed,
            ];
        });

        // Combine and sort all activities
        $activities = collect()
            ->merge($recentEnrollments)
            ->merge($recentSubmissions)
            ->merge($recentQuizAttempts)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return response()->json($activities);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index(Course $course)
    {
        $lessons = $course->lessons()->ordered()->get();

        // Add progress information if user is authenticated
        if (auth()->check()) {
            $lessons->each(function ($lesson) {
                $progress = $lesson->userProgress(auth()->user());
                $lesson->user_progress = $progress;
            });
        }

        return response()->json($lessons);
    }

    public function show(Course $course, Lesson $lesson)
    {
        // Check if lesson belongs to course
        if ($lesson->course_id !== $course->id) {
            return response()->json(['message' => 'Lesson not found in this course'], 404);
        }

        // Check if user has access to this lesson
        if (!$lesson->is_free && !auth()->user()->enrolledCourses->contains($course->id)) {
            return response()->json(['message' => 'You must be enrolled to access this lesson'], 403);
        }

        $lesson->load('course');
        
        // Add progress information
        if (auth()->check()) {
            $lesson->user_progress = $lesson->userProgress(auth()->user());
        }

        return response()->json($lesson);
    }

    public function store(Request $request, Course $course)
    {
        // Check if user is the course instructor or admin
        if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only add lessons to your own courses.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'video_url' => 'sometimes|url',
            'content' => 'sometimes|string',
            'duration_minutes' => 'required|integer|min:1',
            'is_free' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ]);

        // Set order if not provided
        if (!$request->has('order')) {
            $maxOrder = $course->lessons()->max('order') ?? 0;
            $request->merge(['order' => $maxOrder + 1]);
        }

        $lesson = $course->lessons()->create($request->all());

        return response()->json($lesson, 201);
    }

    public function update(Request $request, Course $course, Lesson $lesson)
    {
        // Check if user is the course instructor or admin
        if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only update lessons in your own courses.'], 403);
        }

        if ($lesson->course_id !== $course->id) {
            return response()->json(['message' => 'Lesson not found in this course'], 404);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'video_url' => 'sometimes|url',
            'content' => 'sometimes|string',
            'duration_minutes' => 'sometimes|integer|min:1',
            'is_free' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ]);

        $lesson->update($request->all());

        return response()->json($lesson);
    }

    public function destroy(Course $course, Lesson $lesson)
    {
        // Check if user is the course instructor or admin
        if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. You can only delete lessons from your own courses.'], 403);
        }

        if ($lesson->course_id !== $course->id) {
            return response()->json(['message' => 'Lesson not found in this course'], 404);
        }

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully']);
    }

    public function markComplete(Request $request, Course $course, Lesson $lesson)
    {
        $user = auth()->user();

        // Check if user is enrolled
        if (!$user->enrolledCourses->contains($course->id)) {
            return response()->json(['message' => 'You must be enrolled to mark lessons as complete'], 403);
        }

        $progress = LessonProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'completed' => true,
                'completed_at' => now(),
                'watch_time_seconds' => $request->watch_time_seconds ?? 0,
            ]
        );

        $progress->markAsCompleted();

        return response()->json([
            'message' => 'Lesson marked as complete',
            'progress' => $progress,
        ]);
    }

    public function updateProgress(Request $request, Course $course, Lesson $lesson)
    {
        $user = auth()->user();

        $request->validate([
            'watch_time_seconds' => 'required|integer|min:0',
        ]);

        $progress = LessonProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'watch_time_seconds' => $request->watch_time_seconds,
            ]
        );

        return response()->json($progress);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    // List all assignments for a course
    public function index(Course $course)
    {
        $assignments = $course->assignments()
            ->with(['lesson', 'submissions'])
            ->get();

        return response()->json($assignments);
    }

    // Create new assignment
    public function store(Request $request, Course $course)
    {
        // Check if user is the course instructor
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'lesson_id' => 'nullable|exists:lessons,id',
            'max_points' => 'required|integer|min:1',
            'due_date' => 'nullable|date',
            'allow_late_submission' => 'boolean',
        ]);

        $assignment = $course->assignments()->create($request->all());

        return response()->json($assignment, 201);
    }

    // Get assignment details
    public function show(Assignment $assignment)
    {
        $assignment->load(['course', 'lesson', 'submissions.user']);
        
        return response()->json($assignment);
    }

    // Update assignment
    public function update(Request $request, Assignment $assignment)
    {
        if ($assignment->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'instructions' => 'nullable|string',
            'max_points' => 'sometimes|required|integer|min:1',
            'due_date' => 'nullable|date',
            'allow_late_submission' => 'boolean',
        ]);

        $assignment->update($request->all());

        return response()->json($assignment);
    }

    // Delete assignment
    public function destroy(Assignment $assignment)
    {
        if ($assignment->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }

    // Get all submissions for an assignment (instructor only)
    public function submissions(Assignment $assignment)
    {
        if ($assignment->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = $assignment->submissions()
            ->with(['user', 'grader'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json($submissions);
    }

    // Submit assignment (student)
    public function submit(Request $request, Assignment $assignment)
    {
        // Check if student is enrolled
        $isEnrolled = $assignment->course->enrollments()
            ->where('user_id', auth()->id())
            ->exists();

        if (!$isEnrolled) {
            return response()->json(['message' => 'You must be enrolled in this course'], 403);
        }

        // Check due date
        if ($assignment->due_date && now()->gt($assignment->due_date) && !$assignment->allow_late_submission) {
            return response()->json(['message' => 'Assignment deadline has passed'], 403);
        }

        $request->validate([
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $data = [
            'assignment_id' => $assignment->id,
            'user_id' => auth()->id(),
            'content' => $request->content,
            'max_score' => $assignment->max_points,
            'status' => 'submitted',
            'submitted_at' => now(),
        ];

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('assignments', 'private');
            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
        }

        $submission = AssignmentSubmission::create($data);

        return response()->json($submission, 201);
    }

    // Grade submission (instructor)
    public function grade(Request $request, AssignmentSubmission $submission)
    {
        if ($submission->assignment->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'score' => 'required|integer|min:0|max:' . $submission->max_score,
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
            'status' => 'graded',
            'graded_at' => now(),
            'graded_by' => auth()->id(),
        ]);

        return response()->json($submission);
    }

    // Download submission file
    public function download(AssignmentSubmission $submission)
    {
        // Check authorization
        $isInstructor = $submission->assignment->course->instructor_id === auth()->id();
        $isOwner = $submission->user_id === auth()->id();

        if (!$isInstructor && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$submission->file_path) {
            return response()->json(['message' => 'No file attached'], 404);
        }

        return Storage::disk('private')->download($submission->file_path, $submission->file_name);
    }
}

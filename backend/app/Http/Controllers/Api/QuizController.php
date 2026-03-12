<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\Course;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    // List all quizzes for a course
    public function index(Course $course)
    {
        $quizzes = $course->quizzes()
            ->with(['lesson', 'questions'])
            ->withCount('questions')
            ->get();

        return response()->json($quizzes);
    }

    // Create new quiz
    public function store(Request $request, Course $course)
    {
        if ($course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lesson_id' => 'nullable|exists:lessons,id',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'shuffle_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
        ]);

        $quiz = $course->quizzes()->create($request->all());

        return response()->json($quiz, 201);
    }

    // Get quiz details
    public function show(Quiz $quiz)
    {
        $quiz->load(['course', 'lesson', 'questions']);
        
        return response()->json($quiz);
    }

    // Update quiz
    public function update(Request $request, Quiz $quiz)
    {
        if ($quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'sometimes|required|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'shuffle_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
        ]);

        $quiz->update($request->all());

        return response()->json($quiz);
    }

    // Delete quiz
    public function destroy(Quiz $quiz)
    {
        if ($quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    // Add question to quiz
    public function addQuestion(Request $request, Quiz $quiz)
    {
        if ($quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false,short_answer',
            'options' => 'required_if:type,multiple_choice|array',
            'correct_answers' => 'required|array',
            'points' => 'required|integer|min:1',
            'order' => 'integer',
        ]);

        $question = $quiz->questions()->create($request->all());

        return response()->json($question, 201);
    }

    // Update question
    public function updateQuestion(Request $request, QuizQuestion $question)
    {
        if ($question->quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'question' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:multiple_choice,true_false,short_answer',
            'options' => 'required_if:type,multiple_choice|array',
            'correct_answers' => 'sometimes|required|array',
            'points' => 'sometimes|required|integer|min:1',
            'order' => 'integer',
        ]);

        $question->update($request->all());

        return response()->json($question);
    }

    // Delete question
    public function deleteQuestion(QuizQuestion $question)
    {
        if ($question->quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    // Start quiz attempt (student)
    public function startAttempt(Quiz $quiz)
    {
        // Check if student is enrolled
        $isEnrolled = $quiz->course->enrollments()
            ->where('user_id', auth()->id())
            ->exists();

        if (!$isEnrolled) {
            return response()->json(['message' => 'You must be enrolled in this course'], 403);
        }

        // Check max attempts
        if ($quiz->max_attempts) {
            $attemptCount = $quiz->attempts()
                ->where('user_id', auth()->id())
                ->count();

            if ($attemptCount >= $quiz->max_attempts) {
                return response()->json(['message' => 'Maximum attempts reached'], 403);
            }
        }

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => auth()->id(),
            'started_at' => now(),
            'answers' => [],
        ]);

        $attempt->load('quiz.questions');

        return response()->json($attempt, 201);
    }

    // Submit quiz attempt
    public function submitAttempt(Request $request, QuizAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($attempt->completed_at) {
            return response()->json(['message' => 'Quiz already submitted'], 403);
        }

        $request->validate([
            'answers' => 'required|array',
        ]);

        // Calculate score
        $quiz = $attempt->quiz()->with('questions')->first();
        $score = 0;
        $totalPoints = 0;

        foreach ($quiz->questions as $question) {
            $totalPoints += $question->points;
            $userAnswer = $request->answers[$question->id] ?? null;

            if ($userAnswer && $this->checkAnswer($question, $userAnswer)) {
                $score += $question->points;
            }
        }

        $percentage = $totalPoints > 0 ? ($score / $totalPoints) * 100 : 0;
        $passed = $percentage >= $quiz->passing_score;

        $attempt->update([
            'answers' => $request->answers,
            'score' => $score,
            'total_points' => $totalPoints,
            'completed_at' => now(),
            'passed' => $passed,
        ]);

        return response()->json($attempt);
    }

    // Check if answer is correct
    private function checkAnswer($question, $userAnswer)
    {
        $correctAnswers = $question->correct_answers;

        if ($question->type === 'multiple_choice' || $question->type === 'true_false') {
            return in_array($userAnswer, $correctAnswers);
        }

        // For short answer, do case-insensitive comparison
        if ($question->type === 'short_answer') {
            foreach ($correctAnswers as $correct) {
                if (strcasecmp(trim($userAnswer), trim($correct)) === 0) {
                    return true;
                }
            }
        }

        return false;
    }

    // Get all attempts for a quiz (instructor)
    public function attempts(Quiz $quiz)
    {
        if ($quiz->course->instructor_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attempts = $quiz->attempts()
            ->with('user')
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json($attempts);
    }
}

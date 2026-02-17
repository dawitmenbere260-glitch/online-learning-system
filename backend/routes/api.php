<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\MaterialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public course routes
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{course}', [CourseController::class, 'show']);

// Protected routes
Route::middleware(['auth:sanctum', 'check.blocked'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Course management (for instructors)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    
    // Enrollment
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);

    // Lesson routes
    Route::get('/courses/{course}/lessons', [LessonController::class, 'index']);
    Route::get('/courses/{course}/lessons/{lesson}', [LessonController::class, 'show']);
    Route::post('/courses/{course}/lessons', [LessonController::class, 'store']);
    Route::put('/courses/{course}/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('/courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy']);
    
    // Lesson progress
    Route::post('/courses/{course}/lessons/{lesson}/complete', [LessonController::class, 'markComplete']);
    Route::post('/courses/{course}/lessons/{lesson}/progress', [LessonController::class, 'updateProgress']);

    // Assignments
    Route::get('/courses/{course}/assignments', [AssignmentController::class, 'index']);
    Route::post('/courses/{course}/assignments', [AssignmentController::class, 'store']);
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show']);
    Route::put('/assignments/{assignment}', [AssignmentController::class, 'update']);
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);
    Route::get('/assignments/{assignment}/submissions', [AssignmentController::class, 'submissions']);
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit']);
    Route::put('/submissions/{submission}/grade', [AssignmentController::class, 'grade']);
    Route::get('/submissions/{submission}/download', [AssignmentController::class, 'download']);

    // Quizzes
    Route::get('/courses/{course}/quizzes', [QuizController::class, 'index']);
    Route::post('/courses/{course}/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/questions', [QuizController::class, 'addQuestion']);
    Route::put('/quiz-questions/{question}', [QuizController::class, 'updateQuestion']);
    Route::delete('/quiz-questions/{question}', [QuizController::class, 'deleteQuestion']);
    Route::post('/quizzes/{quiz}/attempt', [QuizController::class, 'startAttempt']);
    Route::post('/quiz-attempts/{attempt}/submit', [QuizController::class, 'submitAttempt']);
    Route::get('/quizzes/{quiz}/attempts', [QuizController::class, 'attempts']);

    // Materials
    Route::get('/courses/{course}/materials', [MaterialController::class, 'index']);
    Route::post('/courses/{course}/materials', [MaterialController::class, 'store']);
    Route::get('/materials/{material}', [MaterialController::class, 'show']);
    Route::put('/materials/{material}', [MaterialController::class, 'update']);
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
    Route::get('/materials/{material}/download', [MaterialController::class, 'download']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/stats', function () {
            return response()->json([
                'total_users' => \App\Models\User::count(),
                'total_courses' => \App\Models\Course::count(),
                'total_enrollments' => \App\Models\Enrollment::count(),
            ]);
        });

        // User management
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/{user}', [UserController::class, 'show']);
        Route::post('/admin/users', [UserController::class, 'store']);
        Route::put('/admin/users/{user}', [UserController::class, 'update']);
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);
        Route::post('/admin/users/{user}/block', [UserController::class, 'block']);
        Route::post('/admin/users/{user}/unblock', [UserController::class, 'unblock']);
    });
});
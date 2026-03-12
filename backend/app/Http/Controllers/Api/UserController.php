<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'blocked') {
                $query->whereNotNull('blocked_at');
            } else {
                $query->whereNull('blocked_at');
            }
        }

        $users = $query->withCount('enrollments')
                      ->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function show(User $user)
    {
        $user->load(['enrollments.course', 'instructedCourses']);
        $user->loadCount('enrollments');
        
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,instructor,admin',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'bio' => $request->bio,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:8',
            'role' => 'sometimes|required|in:student,instructor,admin',
            'bio' => 'nullable|string',
        ]);

        $data = $request->only(['name', 'email', 'role', 'bio']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function block(User $user)
    {
        // Prevent blocking yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot block your own account'], 403);
        }

        $user->update(['blocked_at' => now()]);

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json(['message' => 'User blocked successfully', 'user' => $user]);
    }

    public function unblock(User $user)
    {
        $user->update(['blocked_at' => null]);

        return response()->json(['message' => 'User unblocked successfully', 'user' => $user]);
    }

    // Get instructor profile
    public function instructorProfile()
    {
        $user = auth()->user();
        $user->load('instructedCourses');
        $user->loadCount(['instructedCourses', 'enrollments']);
        
        // Add instructor-specific stats
        $stats = [
            'total_courses' => $user->instructedCourses->count(),
            'published_courses' => $user->instructedCourses->where('status', 'published')->count(),
            'total_students' => \App\Models\Enrollment::whereHas('course', function($query) use ($user) {
                $query->where('instructor_id', $user->id);
            })->distinct('user_id')->count(),
        ];
        
        $user->instructor_stats = $stats;
        
        return response()->json($user);
    }

    // Update instructor profile
    public function updateInstructorProfile(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:255', // URL to avatar image
        ]);

        $user->update($request->only(['name', 'email', 'bio', 'avatar']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}

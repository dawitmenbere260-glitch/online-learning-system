<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseMaterial;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    // List all materials for a course
    public function index(Course $course)
    {
        $materials = $course->materials()
            ->with('lesson')
            ->orderBy('order')
            ->get();

        return response()->json($materials);
    }

    // Upload/create material
    public function store(Request $request, Course $course)
    {
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,video,document,link,image,other',
            'lesson_id' => 'nullable|exists:lessons,id',
            'file' => 'required_without:url|file|max:51200', // 50MB max
            'url' => 'required_without:file|url',
            'order' => 'integer',
            'is_downloadable' => 'boolean',
        ]);

        $data = $request->only(['title', 'description', 'type', 'lesson_id', 'url', 'order', 'is_downloadable']);
        $data['course_id'] = $course->id;

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('materials', 'private');
            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
        }

        $material = CourseMaterial::create($data);

        return response()->json($material, 201);
    }

    // Get material details
    public function show(CourseMaterial $material)
    {
        $material->load(['course', 'lesson']);
        
        return response()->json($material);
    }

    // Update material
    public function update(Request $request, CourseMaterial $material)
    {
        if ($material->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:pdf,video,document,link,image,other',
            'url' => 'nullable|url',
            'order' => 'integer',
            'is_downloadable' => 'boolean',
        ]);

        $material->update($request->all());

        return response()->json($material);
    }

    // Delete material
    public function destroy(CourseMaterial $material)
    {
        if ($material->course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete file if exists
        if ($material->file_path) {
            Storage::disk('private')->delete($material->file_path);
        }

        $material->delete();

        return response()->json(['message' => 'Material deleted successfully']);
    }

    // Download material
    public function download(CourseMaterial $material)
    {
        // Check if student is enrolled or is instructor
        $isInstructor = $material->course->instructor_id === auth()->id();
        $isEnrolled = $material->course->enrollments()
            ->where('user_id', auth()->id())
            ->exists();

        if (!$isInstructor && !$isEnrolled) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$material->is_downloadable && !$isInstructor) {
            return response()->json(['message' => 'This material is not downloadable'], 403);
        }

        if (!$material->file_path) {
            return response()->json(['message' => 'No file attached'], 404);
        }

        return Storage::disk('private')->download($material->file_path, $material->file_name);
    }
}

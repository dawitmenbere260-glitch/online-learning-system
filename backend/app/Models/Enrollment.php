<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'progress',
        'completed_at',
    ];

    protected $casts = [
        'progress' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // Helper methods
    public function isCompleted()
    {
        return !is_null($this->completed_at);
    }

    public function markAsCompleted()
    {
        $this->update([
            'progress' => 100,
            'completed_at' => now(),
        ]);
    }

    public function updateProgress()
    {
        $totalLessons = $this->course->lessons()->count();
        if ($totalLessons === 0) {
            return;
        }

        $completedLessons = LessonProgress::where('user_id', $this->user_id)
            ->whereIn('lesson_id', $this->course->lessons()->pluck('id'))
            ->where('completed', true)
            ->count();

        $progress = ($completedLessons / $totalLessons) * 100;
        
        $this->update(['progress' => $progress]);

        if ($progress >= 100 && !$this->isCompleted()) {
            $this->markAsCompleted();
        }
    }
}
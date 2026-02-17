<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'completed',
        'watch_time_seconds',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    // Helper methods
    public function markAsCompleted()
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);

        // Update course enrollment progress
        $enrollment = Enrollment::where('user_id', $this->user_id)
            ->where('course_id', $this->lesson->course_id)
            ->first();

        if ($enrollment) {
            $enrollment->updateProgress();
        }
    }

    public function updateWatchTime($seconds)
    {
        $this->update(['watch_time_seconds' => $seconds]);
    }
}
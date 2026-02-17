<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'video_url',
        'content',
        'order',
        'duration_minutes',
        'is_free',
        'course_id',
    ];

    protected $casts = [
        'is_free' => 'boolean',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function userProgress(User $user)
    {
        return $this->progress()->where('user_id', $user->id)->first();
    }

    // Scopes
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // Helper methods
    public function isCompleted(User $user)
    {
        $progress = $this->userProgress($user);
        return $progress ? $progress->completed : false;
    }

    public function getWatchTime(User $user)
    {
        $progress = $this->userProgress($user);
        return $progress ? $progress->watch_time_seconds : 0;
    }
}
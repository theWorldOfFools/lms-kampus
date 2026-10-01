<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'room_name',
        'scheduled_at',
        'started_at',
        'ended_at',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Meeting $meeting) {
            if (empty($meeting->room_name)) {
                do {
                    // Format ala Meet tapi unik: lms-xxxx-xxxx
                    $room = 'lms-'.strtolower(Str::random(4)).'-'.strtolower(Str::random(4));
                } while (static::where('room_name', $room)->exists());
                $meeting->room_name = $room;
            } else {
                $meeting->room_name = strtolower(trim($meeting->room_name));
            }
        });
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isStandalone(): bool
    {
        return is_null($this->course_id);
    }

    public function shareUrl(): string
    {
        return url('/meetings/'.$this->id);
    }
}

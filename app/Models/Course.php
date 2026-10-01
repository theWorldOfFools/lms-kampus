<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'sks',
        'dosen_id',
        'semester',
        'academic_year',
        'class_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sks' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Course $course) {
            if (empty($course->class_code)) {
                do {
                    $code = strtoupper(Str::random(7));
                } while (static::where('class_code', $code)->exists());
                $course->class_code = $code;
            }
        });
    }

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id')
            ->withPivot(['status', 'enrolled_at'])
            ->withTimestamps();
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class)->orderByDesc('published_at')->orderByDesc('id');
    }

    public function discussions(): HasMany
    {
        return $this->hasMany(Discussion::class)->orderByDesc('id');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class)->orderByDesc('id');
    }

    public function isMember(int $userId): bool
    {
        return $this->enrollments()->where('student_id', $userId)->where('status', 'active')->exists();
    }
}

<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DiscussionController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MeetingController;
use App\Models\Course;
use App\Models\Meeting;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'appName' => config('app.name'),
        'stats' => [
            'courses' => Course::where('is_active', true)->count(),
            'users' => \App\Models\User::count(),
            'meetings' => Meeting::where('is_active', true)->count(),
        ],
    ]);
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $coursesQuery = Course::with('dosen:id,name')->withCount(['enrollments as students_count' => function ($q) {
            $q->where('status', 'active');
        }])->where('is_active', true);
        if ($user->role === 'dosen') {
            $coursesQuery->where('dosen_id', $user->id);
        } elseif ($user->role === 'mhs') {
            $coursesQuery->whereHas('enrollments', fn ($q) => $q->where('student_id', $user->id)->where('status', 'active'));
        }

        $myCourses = (clone $coursesQuery)->orderByDesc('id')->limit(6)->get();

        $meetingsQuery = Meeting::with(['course:id,code,name'])
            ->where('is_active', true);
        if ($user->role === 'dosen') {
            $meetingsQuery->where(function ($q) use ($user) {
                $q->whereNull('course_id')
                    ->orWhere('created_by', $user->id)
                    ->orWhereHas('course', fn ($cq) => $cq->where('dosen_id', $user->id));
            });
        } elseif ($user->role === 'mhs') {
            $meetingsQuery->where(function ($q) use ($user) {
                $q->whereNull('course_id')
                    ->orWhere('created_by', $user->id)
                    ->orWhereHas('course.enrollments', fn ($eq) => $eq
                        ->where('student_id', $user->id)
                        ->where('status', 'active'));
            });
        }
        $upcomingMeetings = (clone $meetingsQuery)
            ->orderByRaw('scheduled_at NULLS LAST')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'courses' => (clone $coursesQuery)->count(),
                'meetingsToday' => (clone $meetingsQuery)->where(function ($q) {
                    $q->whereDate('scheduled_at', today())->orWhereNull('scheduled_at');
                })->count(),
                'meetingsTotal' => (clone $meetingsQuery)->count(),
            ],
            'myCourses' => $myCourses,
            'upcomingMeetings' => $upcomingMeetings,
        ]);
    });

    Route::get('/meetings', [MeetingController::class, 'index']);
    Route::get('/meetings/create', [MeetingController::class, 'create']);
    Route::post('/meetings', [MeetingController::class, 'store']);
    Route::post('/meetings/join', [MeetingController::class, 'joinByCode']);
    Route::get('/meetings/{meeting}', [MeetingController::class, 'show']);
    Route::get('/meetings/{meeting}/edit', [MeetingController::class, 'edit']);
    Route::put('/meetings/{meeting}', [MeetingController::class, 'update']);
    Route::delete('/meetings/{meeting}', [MeetingController::class, 'destroy']);
    Route::post('/meetings/{meeting}/token', [MeetingController::class, 'token']);
    Route::post('/meetings/{meeting}/end', [MeetingController::class, 'end']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/create', [CourseController::class, 'create']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::post('/courses/join', [CourseController::class, 'join']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::get('/courses/{course}/edit', [CourseController::class, 'edit']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::delete('/courses/{course}/leave', [CourseController::class, 'leave']);
    Route::delete('/courses/{course}/students/{user}', [CourseController::class, 'removeStudent']);

    Route::post('/courses/{course}/materials', [MaterialController::class, 'store']);
    Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);

    Route::post('/courses/{course}/discussions', [DiscussionController::class, 'store']);
    Route::delete('/discussions/{discussion}', [DiscussionController::class, 'destroy']);
});

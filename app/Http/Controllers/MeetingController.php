<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Meeting;
use App\Services\LivekitService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeetingController extends Controller
{
    private function canManageCourse(Course $course, \App\Models\User $user): bool
    {
        return $user->role === 'admin' || ($user->role === 'dosen' && $course->dosen_id === $user->id);
    }

    private function canViewCourse(Course $course, \App\Models\User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'dosen' && $course->dosen_id === $user->id) {
            return true;
        }

        return $course->isMember($user->id);
    }

    private function canViewMeeting(Meeting $meeting, \App\Models\User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($meeting->course_id === null) {
            // Standalone ala Google Meet: semua user login bisa join via link/kode
            return true;
        }
        if ($meeting->created_by === $user->id) {
            return true;
        }

        return $meeting->course ? $this->canViewCourse($meeting->course, $user) : true;
    }

    private function canManageMeeting(Meeting $meeting, \App\Models\User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($meeting->created_by === $user->id) {
            return true;
        }
        if ($meeting->course) {
            return $this->canManageCourse($meeting->course, $user);
        }

        return false;
    }

    private function baseVisibleQuery(\App\Models\User $user)
    {
        $query = Meeting::with(['course:id,code,name', 'creator:id,name'])
            ->where('is_active', true)
            ->orderByDesc('id');

        if ($user->role === 'admin') {
            return $query;
        }

        if ($user->role === 'dosen') {
            return $query->where(function ($q) use ($user) {
                $q->whereNull('course_id') // standalone: semua bisa lihat
                    ->orWhere('created_by', $user->id)
                    ->orWhereHas('course', fn ($cq) => $cq->where('dosen_id', $user->id));
            });
        }

        // mhs: standalone + meeting kelas yang diikuti + buatannya sendiri
        return $query->where(function ($q) use ($user) {
            $q->whereNull('course_id')
                ->orWhere('created_by', $user->id)
                ->orWhereHas('course.enrollments', fn ($eq) => $eq
                    ->where('student_id', $user->id)
                    ->where('status', 'active'));
        });
    }

    private function manageableCourses(\App\Models\User $user)
    {
        $q = Course::where('is_active', true)->select('id', 'code', 'name')->orderBy('name');
        if ($user->role === 'dosen') {
            $q->where('dosen_id', $user->id);
        } elseif ($user->role === 'mhs') {
            // mhs tidak bisa buat meeting per-course, tapi butuh list untuk filter
            $q->whereHas('enrollments', fn ($eq) => $eq
                ->where('student_id', $user->id)->where('status', 'active'));
        }

        return $q->get();
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $meetings = $this->baseVisibleQuery($user)->limit(100)->get();

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings,
            'courses' => $this->manageableCourses($user),
            'canCreateCourseMeeting' => in_array($user->role, ['admin', 'dosen']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Meetings/Form', [
            'meeting' => null,
            'courses' => $user->role === 'mhs'
                ? []
                : $this->manageableCourses($user)->where(fn ($c) => true)->values(),
            'presetCourseId' => (int) $request->query('course_id', 0) ?: null,
            'canCreateCourseMeeting' => in_array($user->role, ['admin', 'dosen']),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['nullable', 'exists:courses,id'],
            'scheduled_at' => ['nullable', 'date'],
            'room_name' => ['nullable', 'string', 'max:64', 'regex:/^[a-zA-Z0-9-]+$/', 'unique:meetings,room_name'],
        ]);

        if (! empty($data['course_id'])) {
            // Meeting per course: hanya admin / dosen pengampu
            abort_unless(in_array($user->role, ['admin', 'dosen']), 403, 'Hanya admin/dosen yang bisa membuat meeting kelas.');
            $course = Course::findOrFail($data['course_id']);
            abort_unless($this->canManageCourse($course, $user), 403);
        }
        // Standalone (course_id null): semua role boleh, ala Google Meet

        $meeting = Meeting::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'course_id' => $data['course_id'] ?? null,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'room_name' => isset($data['room_name']) ? strtolower($data['room_name']) : null,
            'created_by' => $user->id,
        ]);

        return redirect("/meetings/{$meeting->id}")->with('success', 'Meeting dibuat. Kode room: '.$meeting->room_name);
    }

    public function show(Request $request, Meeting $meeting): Response
    {
        $user = $request->user();
        $meeting->load(['course:id,code,name', 'creator:id,name']);
        abort_unless($this->canViewMeeting($meeting, $user), 403);

        // Tandai mulai saat pertama dibuka
        if (is_null($meeting->started_at)) {
            $meeting->update(['started_at' => now()]);
        }

        $svc = new LivekitService();
        $token = $svc->joinToken(
            $meeting->room_name,
            'user-'.$user->id,
            $user->name,
        );
        $url = (string) config('livekit.url');
        $wsUrl = str_starts_with($url, 'http')
            ? preg_replace('#^http#', 'ws', $url)
            : $url;

        return Inertia::render('Meetings/Room', [
            'meeting' => $meeting,
            'canManage' => $this->canManageMeeting($meeting, $user),
            'livekit' => [
                'url' => $url,
                'wsUrl' => $wsUrl,
                'room' => $meeting->room_name,
                'token' => $token,
                'identity' => 'user-'.$user->id,
                'turn' => $this->turnCredentials($request, $user),
            ],
        ]);
    }

    public function edit(Request $request, Meeting $meeting): Response
    {
        abort_unless($this->canManageMeeting($meeting, $request->user()), 403);
        $meeting->load(['course:id,code,name']);

        return Inertia::render('Meetings/Form', [
            'meeting' => $meeting,
            'courses' => $this->manageableCourses($request->user()),
            'presetCourseId' => $meeting->course_id,
            'canCreateCourseMeeting' => true,
        ]);
    }

    public function update(Request $request, Meeting $meeting)
    {
        abort_unless($this->canManageMeeting($meeting, $request->user()), 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['nullable', 'exists:courses,id'],
            'scheduled_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (! empty($data['course_id'])) {
            $course = Course::findOrFail($data['course_id']);
            abort_unless($this->canManageCourse($course, $request->user()) || $request->user()->role === 'admin', 403);
        }

        $meeting->update($data);

        return redirect("/meetings/{$meeting->id}")->with('success', 'Meeting diperbarui.');
    }

    public function destroy(Request $request, Meeting $meeting)
    {
        abort_unless($this->canManageMeeting($meeting, $request->user()), 403);
        $meeting->delete();

        return redirect('/meetings')->with('success', 'Meeting dihapus.');
    }

    public function joinByCode(Request $request)
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:64']]);
        $code = strtolower(trim($data['code']));

        $meeting = is_numeric($code)
            ? Meeting::find($code)
            : Meeting::where('room_name', $code)->first();

        if (! $meeting) {
            return back()->with('error', 'Kode/room meeting tidak ditemukan.');
        }
        abort_unless($this->canViewMeeting($meeting, $request->user()), 403);

        return redirect("/meetings/{$meeting->id}");
    }

    public function token(Request $request, Meeting $meeting)
    {
        abort_unless($this->canViewMeeting($meeting, $request->user()), 403);
        $user = $request->user();
        $svc = new LivekitService();

        return response()->json([
            'room' => $meeting->room_name,
            'url' => (string) config('livekit.url'),
            'token' => $svc->joinToken($meeting->room_name, 'user-'.$user->id, $user->name),
        ]);
    }

    public function end(Request $request, Meeting $meeting)
    {
        abort_unless($this->canManageMeeting($meeting, $request->user()), 403);
        $meeting->update(['ended_at' => now(), 'is_active' => false]);

        return back()->with('success', 'Meeting diakhiri.');
    }

    /**
     * Kredensial TURN time-limited (TURN REST API) untuk user ini.
     * Host diambil dari host yang dipakai browser membuka app, sehingga
     * cocok baik via localhost, 127.0.0.1, maupun LAN IP. null bila
     * TURN_REST_SECRET belum dikonfigurasi (client pakai STUN default).
     */
    private function turnCredentials(Request $request, \App\Models\User $user): ?array
    {
        $secret = (string) config('turn.rest_secret');
        if ($secret === '') {
            return null;
        }

        $ttl = (int) config('turn.ttl_seconds', 7200);
        $expiry = time() + $ttl;
        $username = $expiry.':user-'.$user->id;
        $password = base64_encode(hash_hmac('sha1', $username, $secret, true));
        $host = $request->getHost();
        $port = (int) config('turn.port', 3478);

        return [
            // Paksa TURN/TCP: media mengalir lewat koneksi TCP 3478 yang
            // terbukti ter-forward, bukan via UDP langsung yang terblokir.
            'urls' => ["turn:{$host}:{$port}?transport=tcp"],
            'username' => $username,
            'credential' => $password,
            'expires_at' => date(DATE_ATOM, $expiry),
        ];
    }
}

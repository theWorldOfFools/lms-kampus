<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    private function canManage(Course $course, \App\Models\User $user): bool
    {
        return $user->role === 'admin' || ($user->role === 'dosen' && $course->dosen_id === $user->id);
    }

    private function canView(Course $course, \App\Models\User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'dosen' && $course->dosen_id === $user->id) {
            return true;
        }

        return $course->isMember($user->id);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Course::with('dosen:id,name')->withCount(['enrollments as students_count' => function ($q) {
            $q->where('status', 'active');
        }])->where('is_active', true)->orderByDesc('id');

        if ($user->role === 'dosen') {
            $query->where('dosen_id', $user->id);
        } elseif ($user->role === 'mhs') {
            $query->whereHas('enrollments', function ($q) use ($user) {
                $q->where('student_id', $user->id)->where('status', 'active');
            });
        }

        return Inertia::render('Courses/Index', [
            'courses' => $query->get(),
            'canCreate' => in_array($user->role, ['admin', 'dosen']),
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless(in_array($request->user()->role, ['admin', 'dosen']), 403);

        $dosens = $request->user()->role === 'admin'
            ? User::where('role', 'dosen')->select('id', 'name')->orderBy('name')->get()
            : [];

        return Inertia::render('Courses/Form', [
            'course' => null,
            'dosens' => $dosens,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['admin', 'dosen']), 403);

        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:courses,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sks' => ['nullable', 'integer', 'min:1', 'max:6'],
            'semester' => ['nullable', 'string', 'max:20'],
            'academic_year' => ['nullable', 'string', 'max:15'],
            'dosen_id' => ['nullable', 'exists:users,id'],
        ]);

        $dosenId = $request->user()->role === 'dosen'
            ? $request->user()->id
            : ($data['dosen_id'] ?? $request->user()->id);

        $course = Course::create([
            ...$data,
            'sks' => $data['sks'] ?? 2,
            'semester' => $data['semester'] ?? 'Ganjil',
            'academic_year' => $data['academic_year'] ?? '2026/2027',
            'dosen_id' => $dosenId,
        ]);

        return redirect("/courses/{$course->id}")->with('success', 'Kelas berhasil dibuat. Kode enroll: '.$course->class_code);
    }

    public function show(Request $request, Course $course): Response
    {
        abort_unless($this->canView($course, $request->user()), 403);

        $course->load(['dosen:id,name,email']);
        $materials = $course->materials()->with('author:id,name')->limit(50)->get();
        $discussions = $course->discussions()
            ->whereNull('parent_id')
            ->with(['user:id,name,role', 'replies.user:id,name,role'])
            ->limit(20)
            ->get();
        $students = $course->enrollments()->with('student:id,name,nim_nidn')->where('status', 'active')->get();
        $meetings = \App\Models\Meeting::where('course_id', $course->id)
            ->with('creator:id,name')
            ->where('is_active', true)
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'materials' => $materials,
            'discussions' => $discussions,
            'students' => $students,
            'meetings' => $meetings,
            'canManage' => $this->canManage($course, $request->user()),
            'isMember' => $course->isMember($request->user()->id) || $this->canManage($course, $request->user()),
        ]);
    }

    public function edit(Request $request, Course $course): Response
    {
        abort_unless($this->canManage($course, $request->user()), 403);

        $dosens = $request->user()->role === 'admin'
            ? User::where('role', 'dosen')->select('id', 'name')->orderBy('name')->get()
            : [];

        return Inertia::render('Courses/Form', [
            'course' => $course,
            'dosens' => $dosens,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        abort_unless($this->canManage($course, $request->user()), 403);

        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:courses,code,'.$course->id],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sks' => ['nullable', 'integer', 'min:1', 'max:6'],
            'semester' => ['nullable', 'string', 'max:20'],
            'academic_year' => ['nullable', 'string', 'max:15'],
            'is_active' => ['nullable', 'boolean'],
            'dosen_id' => ['nullable', 'exists:users,id'],
        ]);

        if ($request->user()->role !== 'admin') {
            unset($data['dosen_id']);
        }

        $course->update($data);

        return redirect("/courses/{$course->id}")->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Request $request, Course $course)
    {
        abort_unless($this->canManage($course, $request->user()), 403);

        $course->delete();

        return redirect('/courses')->with('success', 'Kelas dihapus.');
    }

    public function join(Request $request)
    {
        $data = $request->validate([
            'class_code' => ['required', 'string', 'max:10'],
        ]);

        $course = Course::where('class_code', strtoupper($data['class_code']))
            ->where('is_active', true)
            ->first();

        if (! $course) {
            return back()->with('error', 'Kode kelas tidak ditemukan.');
        }

        if ($course->dosen_id === $request->user()->id) {
            return redirect("/courses/{$course->id}")->with('success', 'Anda pengampu kelas ini.');
        }

        $course->enrollments()->firstOrCreate(
            ['student_id' => $request->user()->id],
            ['status' => 'active', 'enrolled_at' => now()]
        );

        return redirect("/courses/{$course->id}")->with('success', 'Berhasil gabung kelas '.$course->name);
    }

    public function leave(Request $request, Course $course)
    {
        $course->enrollments()->where('student_id', $request->user()->id)->delete();

        return redirect('/courses')->with('success', 'Keluar dari kelas.');
    }

    public function removeStudent(Request $request, Course $course, User $user)
    {
        abort_unless($this->canManage($course, $request->user()), 403);

        $course->enrollments()->where('student_id', $user->id)->delete();

        return back()->with('success', 'Mahasiswa dikeluarkan.');
    }
}

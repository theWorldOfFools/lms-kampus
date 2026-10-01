<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Http\Request;

class DiscussionController extends Controller
{
    private function ensureView(Course $course, \App\Models\User $user): void
    {
        $allowed = $user->role === 'admin'
            || ($user->role === 'dosen' && $course->dosen_id === $user->id)
            || $course->isMember($user->id);

        abort_unless($allowed, 403);
    }

    public function store(Request $request, Course $course)
    {
        $this->ensureView($course, $request->user());

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'exists:discussions,id'],
        ]);

        if (! empty($data['parent_id'])) {
            $parent = Discussion::findOrFail($data['parent_id']);
            abort_unless($parent->course_id === $course->id && $parent->parent_id === null, 422);
        }

        $course->discussions()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return back()->with('success', 'Diskusi diposting.');
    }

    public function destroy(Request $request, Discussion $discussion)
    {
        $course = $discussion->course;
        $user = $request->user();

        $allowed = $user->role === 'admin'
            || $discussion->user_id === $user->id
            || ($user->role === 'dosen' && $course->dosen_id === $user->id);

        abort_unless($allowed, 403);

        $discussion->delete();

        return back()->with('success', 'Diskusi dihapus.');
    }
}

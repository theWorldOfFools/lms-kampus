<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    private function ensureManage(Course $course, \App\Models\User $user): void
    {
        abort_unless(
            $user->role === 'admin' || ($user->role === 'dosen' && $course->dosen_id === $user->id),
            403
        );
    }

    public function store(Request $request, Course $course)
    {
        $this->ensureManage($course, $request->user());

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'type' => ['required', 'in:file,link,video,doc'],
            'link_url' => ['nullable', 'url', 'required_if:type,link,video'],
            'file' => ['nullable', 'file', 'max:20480'],
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('materials', 'public');
        }

        $course->materials()->create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'body' => $data['body'] ?? null,
            'type' => $data['type'],
            'file_path' => $filePath,
            'link_url' => $data['link_url'] ?? null,
            'published_at' => now(),
        ]);

        return back()->with('success', 'Materi ditambahkan.');
    }

    public function destroy(Request $request, Material $material)
    {
        $this->ensureManage($material->course, $request->user());

        $material->delete();

        return back()->with('success', 'Materi dihapus.');
    }
}

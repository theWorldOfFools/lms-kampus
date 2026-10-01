import { useForm, Link, router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Course, Material, Discussion, EnrolledStudent } from '@/types/classroom';
import type { Meeting } from '@/types/meeting';

interface Props {
    course: Course & { dosen: { id: number; name: string; email: string } };
    materials: Material[];
    discussions: Discussion[];
    students: EnrolledStudent[];
    meetings: Meeting[];
    canManage: boolean;
    isMember: boolean;
}

export default function Show({ course, materials, discussions, students, meetings, canManage }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [materialType, setMaterialType] = useState('doc');

    const matForm = useForm({
        title: '',
        body: '',
        type: 'doc',
        link_url: '',
        file: null as File | null,
    });
    const submitMaterial = (e: FormEvent) => {
        e.preventDefault();
        matForm.post(`/courses/${course.id}/materials`, {
            forceFormData: true,
            onSuccess: () => {
                matForm.reset();
                setMaterialType('doc');
            },
        });
    };

    const discForm = useForm({ body: '', parent_id: '' as string });
    const submitDiscussion = (e: FormEvent) => {
        e.preventDefault();
        discForm.post(`/courses/${course.id}/discussions`, {
            onSuccess: () => discForm.reset(),
        });
    };

    const replyForm = useForm({ body: '', parent_id: '' as string });
    const submitReply = (parentId: number, e: FormEvent) => {
        e.preventDefault();
        replyForm.setData('parent_id', String(parentId));
        replyForm.post(`/courses/${course.id}/discussions`, {
            onSuccess: () => replyForm.reset(),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Link href="/courses" className="text-sm text-indigo-700 hover:underline">
                ← Semua kelas
            </Link>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-indigo-700 p-6 text-white">
                <div>
                    <p className="text-sm opacity-80">
                        {course.code} • {course.sks} SKS • {course.semester} {course.academic_year}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">{course.name}</h1>
                    <p className="mt-1 text-sm opacity-90">
                        {course.dosen.name} • Kode gabung: <b>{course.class_code}</b> •{' '}
                        {students.length} mahasiswa
                    </p>
                    {course.description && <p className="mt-2 max-w-2xl text-sm opacity-90">{course.description}</p>}
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <Link
                            href={`/courses/${course.id}/edit`}
                            className="rounded-lg bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
                        >
                            Ubah
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Hapus kelas ini?')) router.delete(`/courses/${course.id}`);
                            }}
                            className="rounded-lg bg-red-500/80 px-3 py-1 text-sm hover:bg-red-500"
                        >
                            Hapus
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="font-bold">Meeting Kelas</h2>
                            {canManage && (
                                <Link
                                    href={`/meetings/create?course_id=${course.id}`}
                                    className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
                                >
                                    + Buat Meeting
                                </Link>
                            )}
                        </div>
                        <div className="mt-3 space-y-2">
                            {(meetings ?? []).map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/meetings/${m.id}`}
                                    className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:bg-slate-50"
                                >
                                    <div>
                                        <p className="font-medium">{m.title}</p>
                                        <p className="text-xs text-slate-500">
                                            <span className="font-mono">{m.room_name}</span> •{' '}
                                            {m.scheduled_at
                                                ? new Date(m.scheduled_at).toLocaleString('id-ID')
                                                : 'langsung mulai'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white">
                                        Masuk
                                    </span>
                                </Link>
                            ))}
                            {(meetings ?? []).length === 0 && (
                                <p className="text-sm text-slate-400">
                                    Belum ada meeting untuk kelas ini.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-bold">Materi</h2>
                        {canManage && (
                            <form onSubmit={submitMaterial} className="mt-3 space-y-3 border-t pt-3">
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Judul materi"
                                    value={matForm.data.title}
                                    onChange={(e) => matForm.setData('title', e.target.value)}
                                />
                                <textarea
                                    className="w-full rounded-lg border px-3 py-2"
                                    rows={2}
                                    placeholder="Deskripsi (opsional)"
                                    value={matForm.data.body}
                                    onChange={(e) => matForm.setData('body', e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        className="rounded-lg border px-3 py-2"
                                        value={materialType}
                                        onChange={(e) => {
                                            setMaterialType(e.target.value);
                                            matForm.setData('type', e.target.value);
                                        }}
                                    >
                                        <option value="doc">Teks</option>
                                        <option value="file">File</option>
                                        <option value="link">Link</option>
                                        <option value="video">Video (URL)</option>
                                    </select>
                                    {(materialType === 'link' || materialType === 'video') && (
                                        <input
                                            className="flex-1 rounded-lg border px-3 py-2"
                                            placeholder="https://..."
                                            value={matForm.data.link_url}
                                            onChange={(e) => matForm.setData('link_url', e.target.value)}
                                        />
                                    )}
                                    {materialType === 'file' && (
                                        <input
                                            type="file"
                                            className="flex-1 text-sm"
                                            onChange={(e) =>
                                                matForm.setData('file', e.target.files?.[0] ?? null)
                                            }
                                        />
                                    )}
                                    <button
                                        type="submit"
                                        disabled={matForm.processing}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Posting
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="mt-3 space-y-3">
                            {materials.map((m) => (
                                <div key={m.id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                [{m.type}] {m.author?.name}
                                            </p>
                                            <p className="font-medium">{m.title}</p>
                                            {m.body && <p className="mt-1 text-sm text-slate-600">{m.body}</p>}
                                            {m.link_url && (
                                                <a
                                                    href={m.link_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm text-indigo-700 hover:underline"
                                                >
                                                    {m.link_url}
                                                </a>
                                            )}
                                            {m.file_path && (
                                                <p className="text-sm text-slate-500">File: {m.file_path}</p>
                                            )}
                                        </div>
                                        {canManage && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Hapus materi?'))
                                                        router.delete(`/materials/${m.id}`);
                                                }}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {materials.length === 0 && (
                                <p className="text-sm text-slate-400">Belum ada materi.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-bold">Stream / Diskusi</h2>
                        <form onSubmit={submitDiscussion} className="mt-3 flex gap-2">
                            <input
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="Tulis pengumuman atau pertanyaan..."
                                value={discForm.data.body}
                                onChange={(e) => discForm.setData('body', e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={discForm.processing}
                                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Kirim
                            </button>
                        </form>
                        <div className="mt-4 space-y-4">
                            {discussions.map((d) => (
                                <div key={d.id} className="rounded-lg border p-3">
                                    <p className="text-xs text-slate-400">
                                        {d.user.name} ({d.user.role})
                                    </p>
                                    <p className="mt-1 text-sm">{d.body}</p>
                                    <div className="mt-2 space-y-2 border-l-2 border-slate-100 pl-3">
                                        {d.replies.map((r) => (
                                            <div key={r.id} className="text-sm">
                                                <span className="text-xs text-slate-400">
                                                    {r.user.name}:{' '}
                                                </span>
                                                {r.body}
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        onSubmit={(e) => submitReply(d.id, e)}
                                        className="mt-2 flex gap-2"
                                    >
                                        <input
                                            className="w-full rounded-lg border px-2 py-1 text-sm"
                                            placeholder="Balas..."
                                            value={
                                                replyForm.data.parent_id === String(d.id)
                                                    ? replyForm.data.body
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                replyForm.setData('parent_id', String(d.id));
                                                replyForm.setData('body', e.target.value);
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="shrink-0 rounded-lg border px-3 py-1 text-xs hover:bg-slate-100"
                                        >
                                            Balas
                                        </button>
                                    </form>
                                    {(auth.user?.id === d.user.id || canManage) && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Hapus diskusi?'))
                                                    router.delete(`/discussions/${d.id}`);
                                            }}
                                            className="mt-1 text-xs text-red-600 hover:underline"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            ))}
                            {discussions.length === 0 && (
                                <p className="text-sm text-slate-400">Belum ada diskusi.</p>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="h-fit rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="font-bold">Anggota ({students.length})</h2>
                    <ul className="mt-2 space-y-1 text-sm">
                        {students.map((s) => (
                            <li key={s.id} className="flex items-center justify-between gap-2">
                                <span>
                                    {s.student.name}{' '}
                                    <span className="text-xs text-slate-400">{s.student.nim_nidn}</span>
                                </span>
                                {canManage && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Keluarkan mahasiswa?'))
                                                router.delete(
                                                    `/courses/${course.id}/students/${s.student.id}`,
                                                );
                                        }}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        x
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {students.length === 0 && (
                        <p className="mt-2 text-sm text-slate-400">Belum ada mahasiswa.</p>
                    )}
                </aside>
            </div>
        </AppLayout>
    );
}

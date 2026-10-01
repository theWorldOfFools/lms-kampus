import { useForm, Link } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { Meeting } from '@/types/meeting';

interface Props {
    meeting: Meeting | null;
    courses: { id: number; code: string; name: string }[];
    presetCourseId: number | null;
    canCreateCourseMeeting: boolean;
}

export default function Form({ meeting, courses, presetCourseId, canCreateCourseMeeting }: Props) {
    const isEdit = !!meeting;
    const [mode, setMode] = useState<'course' | 'standalone'>(() => {
        if (meeting) return meeting.course_id !== null ? 'course' : 'standalone';
        if (!canCreateCourseMeeting) return 'standalone';
        return presetCourseId ? 'course' : 'standalone';
    });

    const { data, setData, post, put, processing, errors } = useForm({
        title: meeting?.title ?? '',
        description: meeting?.description ?? '',
        course_id: meeting?.course_id ? String(meeting.course_id) : presetCourseId ? String(presetCourseId) : '',
        scheduled_at: meeting?.scheduled_at
            ? new Date(meeting.scheduled_at).toISOString().slice(0, 16)
            : '',
        room_name: meeting?.room_name ?? '',
        is_active: meeting?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const payload = {
            title: data.title,
            description: data.description || null,
            course_id: mode === 'course' && data.course_id ? Number(data.course_id) : null,
            scheduled_at: data.scheduled_at || null,
            ...(isEdit ? { is_active: data.is_active } : data.room_name ? { room_name: data.room_name.toLowerCase() } : {}),
        };
        if (isEdit && meeting) {
            put(`/meetings/${meeting.id}`, payload as never);
        } else {
            post('/meetings', payload as never);
        }
    };

    return (
        <AppLayout>
            <Link href={isEdit && meeting ? `/meetings/${meeting.id}` : '/meetings'} className="text-sm text-indigo-700 hover:underline">
                ← Kembali
            </Link>
            <h1 className="mt-2 text-xl font-bold">
                {isEdit ? 'Ubah Meeting' : 'Buat Meeting Baru'}
            </h1>

            {!isEdit && canCreateCourseMeeting && (
                <div className="mt-4 flex gap-2 text-sm">
                    <button
                        type="button"
                        onClick={() => setMode('standalone')}
                        className={`rounded-full px-4 py-1.5 ${mode === 'standalone' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'}`}
                    >
                        Standalone (bebas)
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('course')}
                        className={`rounded-full px-4 py-1.5 ${mode === 'course' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'}`}
                    >
                        Per Course
                    </button>
                </div>
            )}

            <form onSubmit={submit} className="mt-4 max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <div>
                    <label className="text-sm font-medium">Judul Meeting</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="mis. Kuliah Basis Data — Pertemuan 5"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium">Deskripsi (opsional)</label>
                    <textarea
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        rows={3}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                </div>

                {mode === 'course' && canCreateCourseMeeting && (
                    <div>
                        <label className="text-sm font-medium">Kelas</label>
                        <select
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.course_id}
                            onChange={(e) => setData('course_id', e.target.value)}
                        >
                            <option value="">— Pilih kelas —</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.code} — {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>}
                    </div>
                )}
                {mode === 'standalone' && (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        Mode standalone: tidak terikat kelas, siapa pun yang login bisa join via link/kode
                        room. Cocok untuk bimbingan, rapat, atau kelas pengganti.
                    </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">Jadwal (opsional)</label>
                        <input
                            type="datetime-local"
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.scheduled_at}
                            onChange={(e) => setData('scheduled_at', e.target.value)}
                        />
                    </div>
                    {!isEdit && (
                        <div>
                            <label className="text-sm font-medium">Kode room custom (opsional)</label>
                            <input
                                className="mt-1 w-full rounded-lg border px-3 py-2 font-mono lowercase"
                                value={data.room_name}
                                onChange={(e) => setData('room_name', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="otomatis: lms-xxxx-xxxx"
                                maxLength={64}
                            />
                            {errors.room_name && <p className="mt-1 text-sm text-red-600">{errors.room_name}</p>}
                        </div>
                    )}
                </div>

                {isEdit && (
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        Meeting aktif
                    </label>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isEdit ? 'Simpan Perubahan' : 'Buat & Masuk Room'}
                </button>
            </form>
        </AppLayout>
    );
}

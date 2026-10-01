import { useForm, Link } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { Meeting } from '@/types/meeting';

interface Props {
    meetings: Meeting[];
    courses: { id: number; code: string; name: string }[];
    canCreateCourseMeeting: boolean;
}

export default function Index({ meetings, courses }: Props) {
    const [tab, setTab] = useState<'all' | 'course' | 'standalone'>('all');
    const joinForm = useForm({ code: '' });
    const submitJoin = (e: FormEvent) => {
        e.preventDefault();
        joinForm.post('/meetings/join', {
            onSuccess: () => joinForm.reset(),
        });
    };

    const filtered = meetings.filter((m) => {
        if (tab === 'course') return m.course_id !== null;
        if (tab === 'standalone') return m.course_id === null;
        return true;
    });

    return (
        <AppLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold">Meeting</h1>
                <Link
                    href="/meetings/create"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    + Buat Meeting
                </Link>
            </div>
            <p className="mt-1 text-sm text-slate-500">
                Meeting per course terikat ke kelas, standalone ala Google Meet bisa dibuat siapa saja &amp;
                dibagikan via link/kode room.
            </p>

            <form
                onSubmit={submitJoin}
                className="mt-4 flex gap-2 rounded-xl bg-white p-4 shadow-sm"
            >
                <input
                    className="w-full rounded-lg border px-3 py-2 font-mono text-sm lowercase"
                    placeholder="Punya kode room? mis. lms-ab12-cd34"
                    value={joinForm.data.code}
                    onChange={(e) => joinForm.setData('code', e.target.value)}
                />
                <button
                    type="submit"
                    disabled={joinForm.processing}
                    className="shrink-0 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
                >
                    Gabung
                </button>
            </form>
            {(joinForm.errors as { code?: string }).code && (
                <p className="mt-1 text-sm text-red-600">{(joinForm.errors as { code?: string }).code}</p>
            )}

            <div className="mt-4 flex gap-2 text-sm">
                {(
                    [
                        ['all', 'Semua'],
                        ['course', 'Per Course'],
                        ['standalone', 'Standalone'],
                    ] as const
                ).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`rounded-full px-4 py-1.5 ${
                            tab === key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((m) => (
                    <Link
                        key={m.id}
                        href={`/meetings/${m.id}`}
                        className="rounded-xl bg-white p-5 shadow-sm hover:shadow"
                    >
                        <p className="text-xs font-medium text-indigo-600">
                            {m.course_id === null ? (
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                    STANDALONE
                                </span>
                            ) : (
                                <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-700">
                                    {m.course?.code ?? 'KELAS'}
                                </span>
                            )}{' '}
                            <span className="font-mono text-slate-400">{m.room_name}</span>
                        </p>
                        <h2 className="mt-2 font-bold">{m.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {m.course?.name ?? 'Room bebas'} • oleh {m.creator?.name ?? '-'}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                            {m.scheduled_at
                                ? 'Jadwal: ' + new Date(m.scheduled_at).toLocaleString('id-ID')
                                : 'Tanpa jadwal — langsung mulai'}
                        </p>
                    </Link>
                ))}
            </div>
            {filtered.length === 0 && (
                <p className="mt-6 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                    Belum ada meeting di tab ini. Buat meeting baru atau gabung dengan kode room.
                    {courses.length === 0
                        ? ''
                        : ` Kamu bisa buat untuk ${courses.length} kelas.`}
                </p>
            )}
        </AppLayout>
    );
}

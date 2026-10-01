import { useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { Course } from '@/types/classroom';

interface Props {
    courses: Course[];
    canCreate: boolean;
}

export default function Index({ courses, canCreate }: Props) {
    const joinForm = useForm({ class_code: '' });
    const submitJoin = (e: FormEvent) => {
        e.preventDefault();
        joinForm.post('/courses/join', {
            onSuccess: () => joinForm.reset(),
        });
    };

    return (
        <AppLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold">Kelas Saya</h1>
                {canCreate && (
                    <Link
                        href="/courses/create"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        + Buat Kelas
                    </Link>
                )}
            </div>

            <form onSubmit={submitJoin} className="mt-4 flex gap-2 rounded-xl bg-white p-4 shadow-sm">
                <input
                    className="w-full rounded-lg border px-3 py-2 uppercase"
                    placeholder="Punya kode kelas? mis. A1B2C3D"
                    value={joinForm.data.class_code}
                    onChange={(e) => joinForm.setData('class_code', e.target.value)}
                    maxLength={10}
                />
                <button
                    type="submit"
                    disabled={joinForm.processing}
                    className="shrink-0 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
                >
                    Gabung
                </button>
            </form>
            {joinForm.errors.class_code && (
                <p className="mt-1 text-sm text-red-600">{joinForm.errors.class_code}</p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                    <Link
                        key={c.id}
                        href={`/courses/${c.id}`}
                        className="rounded-xl bg-white p-5 shadow-sm hover:shadow"
                    >
                        <p className="text-xs font-medium text-indigo-600">
                            {c.code} • {c.sks} SKS
                        </p>
                        <h2 className="mt-1 font-bold">{c.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {c.dosen?.name} • {c.semester} {c.academic_year}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                            {c.students_count ?? 0} mahasiswa • Kode: {c.class_code}
                        </p>
                    </Link>
                ))}
            </div>
            {courses.length === 0 && (
                <p className="mt-6 rounded-xl bg-white p-6 text-center text-sm text-slate-500">
                    Belum ada kelas. Buat kelas baru atau gabung dengan kode.
                </p>
            )}
        </AppLayout>
    );
}

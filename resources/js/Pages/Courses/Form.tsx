import { useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { Course } from '@/types/classroom';

interface Props {
    course: Course | null;
    dosens: { id: number; name: string }[];
}

export default function Form({ course, dosens }: Props) {
    const isEdit = !!course;
    const { data, setData, post, put, processing, errors } = useForm({
        code: course?.code ?? '',
        name: course?.name ?? '',
        description: course?.description ?? '',
        sks: course?.sks ?? 2,
        semester: course?.semester ?? 'Ganjil',
        academic_year: course?.academic_year ?? '2026/2027',
        dosen_id: course?.dosen_id ? String(course.dosen_id) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && course) {
            put(`/courses/${course.id}`);
        } else {
            post('/courses');
        }
    };

    return (
        <AppLayout>
            <Link href="/courses" className="text-sm text-indigo-700 hover:underline">
                ← Kembali
            </Link>
            <h1 className="mt-2 text-xl font-bold">{isEdit ? 'Ubah Kelas' : 'Buat Kelas Baru'}</h1>
            <form onSubmit={submit} className="mt-4 max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">Kode MK</label>
                        <input
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="IF101"
                        />
                        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">SKS</label>
                        <input
                            type="number"
                            min={1}
                            max={6}
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.sks}
                            onChange={(e) => setData('sks', Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Nama Mata Kuliah</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium">Deskripsi</label>
                    <textarea
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        rows={3}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">Semester</label>
                        <select
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.semester}
                            onChange={(e) => setData('semester', e.target.value)}
                        >
                            <option>Ganjil</option>
                            <option>Genap</option>
                            <option>Pendek</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tahun Akademik</label>
                        <input
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.academic_year}
                            onChange={(e) => setData('academic_year', e.target.value)}
                        />
                    </div>
                </div>
                {dosens.length > 0 && (
                    <div>
                        <label className="text-sm font-medium">Dosen Pengampu (admin)</label>
                        <select
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                            value={data.dosen_id}
                            onChange={(e) => setData('dosen_id', e.target.value)}
                        >
                            <option value="">— Saya sendiri —</option>
                            {dosens.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isEdit ? 'Simpan Perubahan' : 'Buat Kelas'}
                </button>
            </form>
        </AppLayout>
    );
}

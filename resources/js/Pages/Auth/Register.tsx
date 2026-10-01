import { useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

const inputCls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100';
const labelCls = 'text-sm font-bold';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nim_nidn: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'mhs',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:py-16">
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100 ring-1 ring-slate-100 sm:p-8 lg:col-span-3">
                    <h1 className="text-2xl font-extrabold tracking-tight">Daftar LMS Kampus</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gratis. Pilih peran, lalu langsung gabung kelas dengan kode.
                    </p>
                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelCls} htmlFor="name">
                                    Nama lengkap
                                </label>
                                <input
                                    id="name"
                                    className={inputCls}
                                    placeholder="Nama sesuai KTM / KTP"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                />
                                {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="nim_nidn">
                                    NIM / NIDN
                                </label>
                                <input
                                    id="nim_nidn"
                                    className={inputCls}
                                    placeholder="mis. 202601001"
                                    value={data.nim_nidn}
                                    onChange={(e) => setData('nim_nidn', e.target.value)}
                                />
                                {errors.nim_nidn && (
                                    <p className="mt-1 text-sm text-rose-600">{errors.nim_nidn}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="role">
                                    Daftar sebagai
                                </label>
                                <select
                                    id="role"
                                    className={inputCls}
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    <option value="mhs">Mahasiswa</option>
                                    <option value="dosen">Dosen</option>
                                </select>
                                {errors.role && <p className="mt-1 text-sm text-rose-600">{String(errors.role)}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls} htmlFor="email">
                                    Email kampus
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={inputCls}
                                    placeholder="nama@student.kampus.ac.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="email"
                                />
                                {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="password">
                                    Kata sandi
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className={inputCls}
                                    placeholder="Min. 8 karakter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="password_confirmation">
                                    Konfirmasi sandi
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className={inputCls}
                                    placeholder="Ulangi sandi"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40 disabled:opacity-50"
                        >
                            {processing ? 'Mendaftarkan…' : 'Buat Akun'} <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-bold text-indigo-700 hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white sm:p-8 lg:col-span-2">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="font-extrabold">Kenapa LMS Kampus?</span>
                    </div>
                    <ul className="relative mt-6 space-y-4">
                        {[
                            { t: 'Kelas + kode enroll', d: 'Dosen buat kelas, mahasiswa gabung 1 klik.' },
                            { t: 'Meeting 1 klik', d: 'Room per course & standalone ala Meet.' },
                            { t: 'Aman per peran', d: 'Admin, dosen, mahasiswa terisolasi rapi.' },
                        ].map((f) => (
                            <li key={f.t} className="flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
                                <span>
                                    <span className="block text-sm font-extrabold">{f.t}</span>
                                    <span className="block text-[13px] text-indigo-100">{f.d}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="relative mt-6 rounded-2xl bg-black/20 p-4 text-xs leading-relaxed text-indigo-100">
                        Tips: setelah daftar sebagai mahasiswa, minta kode kelas ke dosen
                        lalu tempel di halaman Kelas Saya.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}

import { useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, GraduationCap, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

const inputCls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
                {/* Branding — disembunyikan di HP kecil agar fokus ke form */}
                <div className="relative hidden overflow-hidden rounded-3xl bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-600/40 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
                    <div className="relative flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="font-extrabold">LMS Kampus</span>
                    </div>
                    <div className="relative">
                        <h2 className="text-3xl font-extrabold leading-tight">
                            Selamat datang kembali di kelas digitalmu.
                        </h2>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
                            Masuk untuk membuka kelas, materi, diskusi, dan room meeting
                            — semua dalam satu dashboard yang responsif.
                        </p>
                        <div className="mt-6 space-y-2 text-sm">
                            {['Sidebar & navbar adaptif HP–desktop', 'Meeting WebRTC dengan relay TURN', 'Diskusi & materi per kelas'].map(
                                (t) => (
                                    <p key={t} className="flex items-center gap-2 text-slate-200">
                                        <ShieldCheck className="h-4 w-4 text-emerald-400" /> {t}
                                    </p>
                                ),
                            )}
                        </div>
                    </div>
                    <p className="relative font-mono text-xs text-slate-400">
                        demo: budi@kampus.ac.id / password
                    </p>
                </div>

                {/* Form */}
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100 ring-1 ring-slate-100 sm:p-8">
                    <h1 className="text-2xl font-extrabold tracking-tight">Masuk LMS Kampus</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gunakan email atau NIM/NIDN kamu.
                    </p>
                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-bold" htmlFor="login">
                                Email / NIM / NIDN
                            </label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login"
                                    className={`${inputCls} pl-10`}
                                    placeholder="mis. mhs1@student.kampus.ac.id"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                            {errors.login && <p className="mt-1 text-sm text-rose-600">{errors.login}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-bold" htmlFor="password">
                                Kata sandi
                            </label>
                            <div className="relative">
                                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    className={`${inputCls} pl-10`}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
                            )}
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded accent-indigo-600"
                            />
                            Ingat saya di perangkat ini
                        </label>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40 disabled:opacity-50"
                        >
                            {processing ? 'Memeriksa…' : 'Masuk'} <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                    <p className="mt-5 rounded-2xl bg-slate-50 p-3 text-center text-xs text-slate-500 ring-1 ring-slate-100">
                        Akun demo — email:{' '}
                        <span className="font-mono font-bold">mhs1@student.kampus.ac.id</span>{' '}
                        / <span className="font-mono font-bold">password</span>
                    </p>
                    <p className="mt-4 text-center text-sm">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-bold text-indigo-700 hover:underline">
                            Daftar gratis
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}

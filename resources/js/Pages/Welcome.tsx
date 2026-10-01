import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BookOpen,
    Check,
    Copy,
    GraduationCap,
    MessagesSquare,
    MonitorSmartphone,
    PlayCircle,
    ShieldCheck,
    Sparkles,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

interface Props {
    appName: string;
    stats: {
        courses: number;
        users: number;
        meetings: number;
    };
}

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Kelas & Materi',
        desc: 'Kelas per mata kuliah dengan kode gabung, materi teks, file, link, dan video.',
        tone: 'bg-indigo-100 text-indigo-700',
    },
    {
        icon: MessagesSquare,
        title: 'Diskusi Terstruktur',
        desc: 'Thread pengumuman dan tanya jawab dengan balasan berjenjang di setiap kelas.',
        tone: 'bg-emerald-100 text-emerald-700',
    },
    {
        icon: Video,
        title: 'Meeting WebRTC',
        desc: 'Room video per course maupun standalone ala Google Meet dengan relay TURN/TCP.',
        tone: 'bg-rose-100 text-rose-700',
    },
    {
        icon: ShieldCheck,
        title: 'Role & Akses Aman',
        desc: 'Admin, dosen, dan mahasiswa — setiap peran hanya mengelola yang berhak.',
        tone: 'bg-amber-100 text-amber-700',
    },
    {
        icon: MonitorSmartphone,
        title: 'Responsif Penuh',
        desc: 'Sidebar, navbar, dan dashboard rapi di HP, tablet, maupun desktop.',
        tone: 'bg-sky-100 text-sky-700',
    },
    {
        icon: Zap,
        title: 'Cepat & Ringan',
        desc: 'Inertia + Vite, navigasi tanpa reload dengan build yang dioptimalkan.',
        tone: 'bg-violet-100 text-violet-700',
    },
];

const STEPS = [
    {
        title: 'Daftar / Masuk',
        desc: 'Buat akun atau pakai salah satu akun demo di bawah. Tanpa kartu kredit.',
    },
    {
        title: 'Gabung Kelas',
        desc: 'Mahasiswa gabung dengan kode kelas, dosen buat kelas baru dalam 1 menit.',
    },
    {
        title: 'Masuk Meeting',
        desc: 'Klik Masuk dari halaman kelas atau gabung via kode room dari mana saja.',
    },
];

const DEMO_ACCOUNTS = [
    { role: 'Admin', email: 'admin@kampus.ac.id', desc: 'Kelola semua kelas & user' },
    { role: 'Dosen', email: 'budi@kampus.ac.id', desc: 'Buat kelas & meeting' },
    { role: 'Mahasiswa', email: 'mhs1@student.kampus.ac.id', desc: 'Gabung & diskusi' },
];

const FAQS = [
    {
        q: 'Apakah bisa dipakai di HP?',
        a: 'Bisa. Seluruh halaman — landing, dashboard, kelas, dan room meeting — dirancang mobile-first dan diuji di layar kecil. Sidebar berubah menjadi drawer di HP.',
    },
    {
        q: 'Bagaimana cara gabung kelas?',
        a: 'Minta kode kelas (mis. A1B2C3D) ke dosen, lalu masuk ke halaman Kelas Saya dan tempel kode di kolom Gabung.',
    },
    {
        q: 'Apakah meeting butuh aplikasi tambahan?',
        a: 'Tidak. Cukup browser modern (Chrome/Edge/Firefox). Jika jaringan kampus memblokir UDP, media otomatis lewat relay TURN/TCP.',
    },
    {
        q: 'Siapa saja yang bisa buat meeting?',
        a: 'Semua peran bisa membuat meeting standalone ala Google Meet. Meeting per course hanya bisa dibuat admin/dosen pengampu.',
    },
];

export default function Welcome({ appName, stats }: Props) {
    const [copied, setCopied] = useState('');

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(text);
            setTimeout(() => setCopied(''), 2000);
        } catch {
            /* abaikan */
        }
    };

    return (
        <GuestLayout>
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-20 lg:pt-16">
                    <div className="min-w-0">
                        <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="truncate">
                                Google Classroom + Meet versi kampus
                            </span>
                        </p>
                        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                            Satu platform untuk{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                kelas & meeting
                            </span>{' '}
                            kampus
                        </h1>
                        <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                            Kelola kelas, materi, dan diskusi — lalu lanjut tatap muka
                            lewat room video WebRTC, baik terikat mata kuliah maupun
                            room bebas.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
                            >
                                Mulai Belajar Gratis <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold shadow-sm transition hover:bg-slate-50"
                            >
                                <PlayCircle className="h-4 w-4" /> Lihat Demo Masuk
                            </Link>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <BadgeCheck className="h-4 w-4 text-emerald-600" /> Tanpa
                                aplikasi tambahan
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <BadgeCheck className="h-4 w-4 text-emerald-600" /> Responsif
                                HP & Desktop
                            </span>
                        </div>

                        {/* Statistik live */}
                        <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-indigo-100/50 ring-1 ring-slate-100">
                            {[
                                { value: stats.courses, label: 'Kelas aktif' },
                                { value: stats.users, label: 'Pengguna' },
                                { value: stats.meetings, label: 'Meeting aktif' },
                            ].map((s) => (
                                <div key={s.label} className="min-w-0 text-center sm:text-left">
                                    <dt className="order-2 mt-1 text-xs font-medium text-slate-500">
                                        {s.label}
                                    </dt>
                                    <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                        {s.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Mockup dashboard + akun demo */}
                    <div className="min-w-0">
                        {/* Preview UI */}
                        <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl ring-1 ring-slate-900">
                            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-2 hidden truncate font-mono text-xs text-slate-400 sm:block">
                                    {appName} — /dashboard
                                </span>
                            </div>
                            <div className="grid gap-3 p-4 sm:grid-cols-5">
                                <div className="hidden rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:col-span-2 sm:block">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
                                            <GraduationCap className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold">LMS Kampus</p>
                                            <p className="text-[11px] text-slate-400">Sidebar</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1.5">
                                        {['Dashboard', 'Kelas Saya', 'Meeting'].map((m, i) => (
                                            <div
                                                key={m}
                                                className={`rounded-lg px-2.5 py-2 text-xs font-semibold ${
                                                    i === 0
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white/5 text-slate-300'
                                                }`}
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <p className="text-xs font-bold text-slate-300">
                                        Halo, selamat datang 👋
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {[
                                            { l: 'Kelas', v: String(stats.courses) },
                                            { l: 'Meeting', v: String(stats.meetings) },
                                        ].map((c) => (
                                            <div
                                                key={c.l}
                                                className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
                                            >
                                                <p className="text-lg font-extrabold">{c.v}</p>
                                                <p className="text-[11px] text-slate-400">{c.l}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-3">
                                        <p className="text-xs font-bold">
                                            Room SI-101 • Struktur Data
                                        </p>
                                        <p className="mt-0.5 font-mono text-[11px] opacity-80">
                                            lms-a1b2-c3d4 • 24 peserta
                                        </p>
                                        <span className="mt-2 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700">
                                            Masuk Sekarang
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Akun demo */}
                        <div
                            id="akun-demo"
                            className="mt-4 scroll-mt-24 rounded-3xl bg-white p-5 shadow-xl shadow-indigo-100 ring-1 ring-slate-100 sm:p-6"
                        >
                            <h2 className="flex items-center gap-2 text-base font-extrabold">
                                <Users className="h-5 w-5 text-indigo-600" /> Coba langsung —
                                akun demo
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Semua password:{' '}
                                <code className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold">
                                    password
                                </code>
                            </p>
                            <div className="mt-4 space-y-2.5">
                                {DEMO_ACCOUNTS.map((a) => (
                                    <div
                                        key={a.email}
                                        className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                                                {a.role}
                                            </p>
                                            <p className="truncate font-mono text-[13px]">
                                                {a.email}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-400">
                                                {a.desc}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => void copy(a.email)}
                                            className="flex shrink-0 items-center gap-1 rounded-xl border bg-white px-3 py-2 text-xs font-bold shadow-sm transition hover:bg-slate-100"
                                        >
                                            {copied === a.email ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />{' '}
                                                    Tersalin
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5" /> Salin
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/login"
                                className="mt-4 block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-700"
                            >
                                Ke halaman masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strip kepercayaan */}
            <section className="border-y border-slate-100 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Dipercaya untuk alur kampus sehari-hari
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-bold text-slate-500">
                        <span>Kelas</span>
                        <span>Materi</span>
                        <span>Diskusi</span>
                        <span>Meeting WebRTC</span>
                    </div>
                </div>
            </section>

            {/* Fitur */}
            <section id="fitur" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
                <p className="text-center text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                    Fitur unggulan
                </p>
                <h2 className="mx-auto mt-2 max-w-2xl text-center text-2xl font-extrabold tracking-tight sm:text-4xl">
                    Semua kebutuhan kelas dalam satu tempat
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-slate-500 sm:text-base">
                    Dari materi sampai video conference, tanpa aplikasi tambahan dan
                    tetap nyaman dibuka dari HP.
                </p>
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <span
                                className={`inline-flex rounded-2xl p-3 transition group-hover:scale-110 ${f.tone}`}
                            >
                                <f.icon className="h-6 w-6" />
                            </span>
                            <h3 className="mt-4 font-extrabold">{f.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cara pakai */}
            <section id="cara" className="scroll-mt-20 bg-slate-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                    <div className="grid items-end justify-between gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                                Cara pakai
                            </p>
                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">
                                Mulai dalam 3 langkah
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-relaxed text-slate-300">
                            Alur yang sama untuk dosen dan mahasiswa — bedanya hanya di
                            hak akses pembuatan kelas.
                        </p>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.title}
                                className="relative overflow-hidden rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-extrabold shadow-lg">
                                    {i + 1}
                                </span>
                                <h3 className="mt-4 font-extrabold">{s.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                                    {s.desc}
                                </p>
                                <span className="pointer-events-none absolute -bottom-6 -right-2 text-[120px] font-extrabold leading-none text-white/5">
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-slate-900 transition hover:bg-indigo-50 sm:w-auto"
                        >
                            Daftar gratis <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:w-auto"
                        >
                            Masuk dengan akun demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Untuk siapa */}
            <section id="peran" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
                <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-4xl">
                    Dirancang untuk semua peran
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500 sm:text-base">
                    Tampilan dan menu menyesuaikan otomatis berdasarkan peran kamu.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            role: 'Dosen',
                            points: ['Buat kelas & kode enroll', 'Upload materi & kelola diskusi', 'Buat meeting per course'],
                        },
                        {
                            role: 'Mahasiswa',
                            points: ['Gabung via kode kelas', 'Akses materi & ikut diskusi', 'Masuk meeting 1 klik'],
                        },
                        {
                            role: 'Admin',
                            points: ['Kelola semua kelas', 'Kelola user & peran', 'Pantau meeting aktif'],
                        },
                    ].map((r) => (
                        <div
                            key={r.role}
                            className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 ring-1 ring-slate-100"
                        >
                            <p className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
                                {r.role}
                            </p>
                            <ul className="mt-4 space-y-2.5">
                                {r.points.map((p) => (
                                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20 bg-slate-50">
                <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
                    <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Pertanyaan umum
                    </h2>
                    <div className="mt-8 space-y-3">
                        {FAQS.map((f) => (
                            <details
                                key={f.q}
                                className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 open:shadow-md"
                            >
                                <summary className="cursor-pointer list-none text-sm font-extrabold">
                                    <span className="flex items-center justify-between gap-3">
                                        {f.q}
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-indigo-600 group-open:text-white">
                                            +
                                        </span>
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                            </details>
                        ))}
                    </div>

                    {/* CTA akhir */}
                    <div className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white shadow-xl sm:p-10">
                        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
                        <h3 className="relative text-xl font-extrabold sm:text-2xl">
                            Siap memulai kelas pertamamu?
                        </h3>
                        <p className="relative mx-auto mt-2 max-w-md text-sm text-indigo-100">
                            Daftar dalam 1 menit, buat kelas, dan undang mahasiswa dengan
                            kode enroll.
                        </p>
                        <div className="relative mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                            <Link
                                href="/register"
                                className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
                            >
                                Daftar Sekarang
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-2xl bg-white/20 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/30 transition hover:bg-white/30"
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}

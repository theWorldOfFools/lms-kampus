import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    CirclePlay,
    ClipboardList,
    PlusCircle,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';
import type { Course } from '@/types/classroom';
import type { Meeting } from '@/types/meeting';
import { Avatar, Badge, EmptyState, SectionCard, StatCard } from '@/components/ui';

interface Props {
    stats: {
        courses: number;
        meetingsToday: number;
        meetingsTotal?: number;
    };
    myCourses?: Array<Course & { dosen?: { id: number; name: string } }>;
    upcomingMeetings?: Meeting[];
}

const GRADIENTS = [
    'from-indigo-600 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
    'from-rose-500 to-pink-600',
    'from-purple-500 to-indigo-600',
];

function greeting(): string {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
}

function formatSchedule(value: string | null): string {
    if (!value) return 'Tanpa jadwal — siap dimulai';
    try {
        return new Date(value).toLocaleString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

export default function Dashboard({ stats, myCourses = [], upcomingMeetings = [] }: Props) {
    const { auth } = usePage<PageProps>().props;
    const name = auth.user?.name ?? 'Sobat Kampus';
    const firstName = name.split(' ')[0];
    const role = auth.user?.role;
    const canCreate = role === 'admin' || role === 'dosen';

    return (
        <AppLayout
            title="Dashboard"
            subtitle={`Halo ${firstName}, ini ringkasan belajar kamu hari ini`}
            actions={
                <>
                    <Link
                        href="/meetings/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
                    >
                        <Video className="h-4 w-4" /> Buat Meeting
                    </Link>
                    {canCreate && (
                        <Link
                            href="/courses/create"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
                        >
                            <PlusCircle className="h-4 w-4" /> Kelas
                        </Link>
                    )}
                </>
            }
        >
            {/* Hero sambutan */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_50%)]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200 ring-1 ring-white/15">
                            <Sparkles className="h-3.5 w-3.5" /> {greeting()}, {firstName}!
                        </p>
                        <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                            Siap lanjut belajar hari ini?
                        </h2>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                            Kamu punya{' '}
                            <b className="text-white">{stats.courses} kelas</b> dan{' '}
                            <b className="text-white">{stats.meetingsToday} meeting</b>{' '}
                            yang siap diikuti. Masuk room atau buka materi terbaru.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-indigo-50"
                            >
                                <BookOpen className="h-4 w-4" /> Buka Kelas
                            </Link>
                            <Link
                                href="/meetings"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
                            >
                                <CirclePlay className="h-4 w-4" /> Masuk Meeting{' '}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Mini profil */}
                    <div className="w-full max-w-sm shrink-0 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <Avatar name={name} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">{name}</p>
                                <p className="truncate text-xs text-slate-300">
                                    {auth.user?.email} •{' '}
                                    {role === 'admin'
                                        ? 'Administrator'
                                        : role === 'dosen'
                                          ? 'Dosen'
                                          : 'Mahasiswa'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                                <p className="text-xl font-extrabold">{stats.courses}</p>
                                <p className="text-[11px] font-medium text-slate-300">Kelas</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                                <p className="text-xl font-extrabold">{stats.meetingsToday}</p>
                                <p className="text-[11px] font-medium text-slate-300">
                                    Meeting hari ini
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistik */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    icon={BookOpen}
                    label="Total Kelas"
                    value={stats.courses}
                    tone="indigo"
                    hint={role === 'mhs' ? 'Kelas yang kamu ikuti' : 'Kelas aktif kamu'}
                />
                <StatCard
                    icon={CalendarDays}
                    label="Meeting Hari Ini"
                    value={stats.meetingsToday}
                    tone="emerald"
                    hint="Siap dimulai / terjadwal"
                />
                <StatCard
                    icon={Video}
                    label="Total Meeting"
                    value={stats.meetingsTotal ?? '-'}
                    tone="sky"
                    hint="Per course + standalone"
                />
                <StatCard
                    icon={Users}
                    label="Mahasiswa di Kelasku"
                    value={myCourses.reduce((a, c) => a + (c.students_count ?? 0), 0)}
                    tone="amber"
                    hint="Akumulasi semua kelas"
                />
            </div>

            {/* Aksi cepat */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                    {
                        href: '/courses',
                        icon: ClipboardList,
                        title: 'Lihat Kelas',
                        desc: 'Materi & diskusi terbaru',
                        cls: 'hover:border-indigo-300 hover:shadow-indigo-100',
                    },
                    {
                        href: '/meetings/create',
                        icon: Video,
                        title: 'Mulai Meeting',
                        desc: 'Room instan ala Meet',
                        cls: 'hover:border-emerald-300 hover:shadow-emerald-100',
                    },
                    {
                        href: canCreate ? '/courses/create' : '/meetings',
                        icon: PlusCircle,
                        title: canCreate ? 'Buat Kelas Baru' : 'Gabung via Kode',
                        desc: canCreate ? 'Siapkan mata kuliah' : 'Masukkan kode room',
                        cls: 'hover:border-amber-300 hover:shadow-amber-100',
                    },
                ].map((a) => (
                    <Link
                        key={a.title}
                        href={a.href}
                        className={`group flex items-center gap-3 rounded-2xl border border-transparent bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:shadow-lg ${a.cls}`}
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white transition group-hover:scale-105">
                            <a.icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{a.title}</span>
                            <span className="block truncate text-xs text-slate-500">{a.desc}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-600" />
                    </Link>
                ))}
            </div>

            {/* Konten 2 kolom */}
            <div className="mt-5 grid gap-4 lg:grid-cols-5">
                {/* Kelas */}
                <div className="lg:col-span-3">
                    <SectionCard
                        title="Kelas Saya"
                        subtitle={`${myCourses.length} kelas terbaru ditampilkan`}
                        action={
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
                            >
                                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        }
                    >
                        {myCourses.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="Belum ada kelas"
                                hint="Buat kelas baru atau gabung dengan kode kelas"
                            />
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {myCourses.map((c, i) => (
                                    <Link
                                        key={c.id}
                                        href={`/courses/${c.id}`}
                                        className="group overflow-hidden rounded-2xl ring-1 ring-slate-100 transition hover:shadow-lg hover:ring-indigo-200"
                                    >
                                        <div
                                            className={`bg-gradient-to-r p-4 text-white ${GRADIENTS[i % GRADIENTS.length]}`}
                                        >
                                            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                                                {c.code} • {c.sks} SKS
                                            </p>
                                            <h3 className="mt-1 line-clamp-1 font-extrabold">
                                                {c.name}
                                            </h3>
                                            <p className="mt-0.5 truncate text-xs opacity-80">
                                                {c.dosen?.name ?? '-'} • {c.semester}{' '}
                                                {c.academic_year}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between bg-white px-4 py-3">
                                            <span className="text-xs font-medium text-slate-500">
                                                {c.students_count ?? 0} mahasiswa •{' '}
                                                <span className="font-mono font-bold text-slate-700">
                                                    {c.class_code}
                                                </span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                                                Buka{' '}
                                                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Meeting */}
                <div className="lg:col-span-2">
                    <SectionCard
                        title="Meeting Berikutnya"
                        subtitle="Jadwal terdekat & room siap"
                        action={
                            <Link
                                href="/meetings"
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
                            >
                                Semua <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        }
                    >
                        {upcomingMeetings.length === 0 ? (
                            <EmptyState
                                icon={Video}
                                title="Belum ada meeting"
                                hint="Buat room baru atau gabung via kode"
                            />
                        ) : (
                            <div className="space-y-2.5">
                                {upcomingMeetings.map((m) => (
                                    <Link
                                        key={m.id}
                                        href={`/meetings/${m.id}`}
                                        className="group flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-md hover:ring-indigo-200"
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                                            <Video className="h-5 w-5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-bold">
                                                {m.title}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500">
                                                {m.course
                                                    ? `${m.course.code} • `
                                                    : 'Standalone • '}
                                                {formatSchedule(m.scheduled_at)}
                                            </span>
                                            <span className="mt-1 inline-block">
                                                <Badge
                                                    tone={
                                                        m.course_id === null ? 'emerald' : 'indigo'
                                                    }
                                                >
                                                    <span className="font-mono">
                                                        {m.room_name}
                                                    </span>
                                                </Badge>
                                            </span>
                                        </span>
                                        <span className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition group-hover:bg-indigo-600">
                                            Masuk
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Tips */}
                        <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100">
                            <p className="text-[13px] font-bold text-amber-900">
                                Tips meeting lancar
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-amber-800/70">
                                Gunakan Chrome di jaringan stabil. Jika UDP terblokir,
                                aplikasi otomatis memakai relay TURN/TCP.
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}

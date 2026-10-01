import { useEffect, useState, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    ChevronRight,
    GraduationCap,
    House,
    LayoutDashboard,
    LogOut,
    Menu,
    PlusCircle,
    Search,
    Settings2,
    Video,
    X,
} from 'lucide-react';
import type { PageProps } from '@/types';
import { Avatar, Badge } from '@/components/ui';

interface MenuItem {
    href: string;
    label: string;
    desc: string;
    icon: typeof LayoutDashboard;
    match: (url: string) => boolean;
    roles?: Array<'admin' | 'dosen' | 'mhs'>;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

const GROUPS: MenuGroup[] = [
    {
        title: 'Utama',
        items: [
            {
                href: '/dashboard',
                label: 'Dashboard',
                desc: 'Ringkasan belajar',
                icon: LayoutDashboard,
                match: (url) => url === '/dashboard' || url.startsWith('/dashboard?'),
            },
        ],
    },
    {
        title: 'Pembelajaran',
        items: [
            {
                href: '/courses',
                label: 'Kelas Saya',
                desc: 'Materi & diskusi',
                icon: BookOpen,
                match: (url) => url.startsWith('/courses') && url !== '/courses/create',
            },
            {
                href: '/meetings',
                label: 'Meeting',
                desc: 'Video conference',
                icon: Video,
                match: (url) => url.startsWith('/meetings') && url !== '/meetings/create',
            },
        ],
    },
    {
        title: 'Aksi Cepat',
        items: [
            {
                href: '/courses/create',
                label: 'Buat Kelas',
                desc: 'Kelas baru',
                icon: PlusCircle,
                match: (url) => url === '/courses/create',
                roles: ['admin', 'dosen'],
            },
            {
                href: '/meetings/create',
                label: 'Buat Meeting',
                desc: 'Room baru',
                icon: Settings2,
                match: (url) => url === '/meetings/create',
            },
        ],
    },
];

function metaFor(url: string): { title: string; subtitle: string } {
    if (url.startsWith('/dashboard'))
        return { title: 'Dashboard', subtitle: 'Pantau kelas dan meeting kamu hari ini' };
    if (url === '/courses/create')
        return { title: 'Buat Kelas', subtitle: 'Siapkan mata kuliah baru untuk mahasiswa' };
    if (url.startsWith('/courses'))
        return { title: 'Kelas Saya', subtitle: 'Kelola materi, diskusi, dan anggota kelas' };
    if (url === '/meetings/create')
        return { title: 'Buat Meeting', subtitle: 'Siapkan room video per kelas atau standalone' };
    if (url.startsWith('/meetings'))
        return { title: 'Meeting', subtitle: 'Masuk room atau bagikan kode ke peserta' };
    return { title: 'LMS Kampus', subtitle: 'Platform pembelajaran kampus' };
}

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    dosen: 'Dosen',
    mhs: 'Mahasiswa',
};

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
    const { props: { auth }, url } = usePage<PageProps>();
    const role = auth.user?.role;

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Brand */}
            <Link
                href={auth.user ? '/dashboard' : '/'}
                onClick={onNavigate}
                className="group flex items-center gap-3 px-5 pb-5 pt-6"
            >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 transition group-hover:shadow-indigo-600/40">
                    <GraduationCap className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-[15px] font-extrabold tracking-tight">
                        LMS Kampus
                    </span>
                    <span className="block text-[11px] font-medium text-slate-400">
                        Belajar kapan saja
                    </span>
                </span>
            </Link>

            {/* Menu */}
            <nav className="nice-scroll flex-1 space-y-5 overflow-y-auto px-3 pb-4">
                {GROUPS.map((g) => {
                    const items = g.items.filter(
                        (m) => !m.roles || (role && m.roles.includes(role)),
                    );
                    if (items.length === 0) return null;
                    return (
                        <div key={g.title}>
                            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {g.title}
                            </p>
                            <div className="space-y-1">
                                {items.map((item) => {
                                    const active = item.match(url);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href + item.label}
                                            href={item.href}
                                            onClick={onNavigate}
                                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                                                active
                                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                                                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                                    active
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm'
                                                }`}
                                            >
                                                <Icon className="h-[17px] w-[17px]" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold leading-tight">
                                                    {item.label}
                                                </span>
                                                <span
                                                    className={`block truncate text-[11px] ${
                                                        active ? 'text-indigo-100' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {item.desc}
                                                </span>
                                            </span>
                                            {active && (
                                                <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Bantuan */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 ring-1 ring-indigo-100/60">
                    <p className="text-[13px] font-bold text-indigo-900">Butuh room cepat?</p>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-700/70">
                        Buat meeting standalone lalu bagikan kode room ke peserta.
                    </p>
                    <Link
                        href="/meetings/create"
                        onClick={onNavigate}
                        className="mt-3 block rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Buat Meeting
                    </Link>
                </div>
            </nav>

            {/* User */}
            {auth.user && (
                <div className="border-t border-slate-100 p-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                        <Avatar name={auth.user.name} size="sm" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold leading-tight">
                                {auth.user.name}
                            </p>
                            <div className="mt-1">
                                <Badge tone="indigo">
                                    {roleLabels[auth.user.role] ?? auth.user.role}
                                </Badge>
                            </div>
                        </div>
                        <button
                            onClick={() => router.post('/logout')}
                            title="Keluar"
                            className="rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:text-rose-600"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
    const { props: { flash, auth }, url } = usePage<PageProps>();
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const fallback = metaFor(url ?? '');

    // Kunci drawer dengan Escape + cegah scroll badan saat terbuka
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open ]);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!q.trim()) return;
        // Arahkan ke list yang paling relevan: kelas dulu
        router.visit(`/courses?search=${encodeURIComponent(q.trim())}`, {
            preserveState: false,
        });
        setQ('');
    };

    return (
        <div className="min-h-screen bg-[#f1f4fb] text-slate-900">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-slate-200/70 lg:block">
                <SidebarBody />
            </aside>

            {/* Drawer mobile */}
            <div
                className={`fixed inset-0 z-50 transition lg:hidden ${
                    open ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                aria-hidden={!open}
            >
                <div
                    onClick={() => setOpen(false)}
                    className={`absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity ${
                        open ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                <aside
                    className={`absolute inset-y-0 left-0 w-[300px] max-w-[86vw] shadow-2xl transition-transform duration-300 ${
                        open ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-3 top-5 z-10 rounded-xl bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
                        aria-label="Tutup menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <SidebarBody onNavigate={() => setOpen(false)} />
                </aside>
            </div>

            <div className="lg:pl-[272px]">
                {/* Navbar / Topbar */}
                <header className="sticky top-0 z-40 border-b border-white/40 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
                        <button
                            onClick={() => setOpen(true)}
                            className="rounded-xl p-2 text-slate-600 ring-1 ring-transparent transition hover:bg-slate-100 lg:hidden"
                            aria-label="Buka menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <House className="h-3 w-3" />
                                <span className="hidden sm:inline">LMS Kampus</span>
                                <ChevronRight className="hidden h-3 w-3 sm:block" />
                                <span className="truncate text-slate-500">
                                    {title ?? fallback.title}
                                </span>
                            </div>
                            <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">
                                {title ?? fallback.title}
                            </h1>
                            <p className="hidden truncate text-xs text-slate-500 md:block">
                                {subtitle ?? fallback.subtitle}
                            </p>
                        </div>

                        {/* Search — desktop */}
                        <form
                            onSubmit={submitSearch}
                            className="relative hidden min-w-0 flex-1 max-w-xs items-center md:flex"
                        >
                            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari kelas / meeting…"
                                className="w-full rounded-xl border-0 bg-slate-100/80 py-2.5 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-indigo-500"
                            />
                        </form>

                        {actions && (
                            <div className="hidden shrink-0 items-center gap-2 sm:flex">
                                {actions}
                            </div>
                        )}

                        <button
                            className="relative shrink-0 rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
                            aria-label="Notifikasi"
                            title="Notifikasi"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        </button>

                        {auth.user && (
                            <Link
                                href="/dashboard"
                                className="flex shrink-0 items-center gap-2 rounded-xl bg-white py-1.5 pl-1.5 pr-2 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 sm:pr-3"
                                title={auth.user.name}
                            >
                                <Avatar name={auth.user.name} size="sm" />
                                <span className="hidden min-w-0 text-left xl:block">
                                    <span className="block max-w-[140px] truncate text-[13px] font-bold leading-tight">
                                        {auth.user.name}
                                    </span>
                                    <span className="block text-[11px] font-medium text-slate-400">
                                        {roleLabels[auth.user.role] ?? auth.user.role}
                                    </span>
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Search — mobile */}
                    <div className="px-3 pb-3 md:hidden">
                        <form onSubmit={submitSearch} className="relative flex items-center">
                            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari kelas / meeting…"
                                className="w-full rounded-xl bg-slate-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </form>
                        {actions && (
                            <div className="mt-2 flex items-center gap-2 overflow-x-auto sm:hidden">
                                {actions}
                            </div>
                        )}
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7">
                    {flash.success && (
                        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                            <span>{flash.error}</span>
                        </div>
                    )}
                    {children}

                    <p className="mt-10 pb-2 text-center text-xs text-slate-400">
                        LMS Kampus • Kelas, Materi, Diskusi & Meeting WebRTC
                    </p>
                </main>
            </div>
        </div>
    );
}

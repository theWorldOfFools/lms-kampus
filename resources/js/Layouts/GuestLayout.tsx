import { useEffect, useState, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, GraduationCap, Menu, X } from 'lucide-react';
import type { PageProps } from '@/types';

const LINKS = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#cara', label: 'Cara Pakai' },
    { href: '#peran', label: 'Untuk Siapa' },
    { href: '#akun-demo', label: 'Akun Demo' },
    { href: '#faq', label: 'FAQ' },
];

export default function GuestLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased">
            {/* Navbar publik */}
            <header
                className={`sticky top-0 z-40 transition ${
                    scrolled
                        ? 'border-b border-slate-200/70 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl'
                        : 'border-b border-transparent bg-white/70 backdrop-blur'
                }`}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="leading-tight">
                            <span className="block text-[15px] font-extrabold tracking-tight">
                                LMS Kampus
                            </span>
                            <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                                Kelas • Materi • Meeting
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 lg:flex">
                        {LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-indigo-700"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
                            >
                                Ke Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
                                >
                                    Daftar Gratis <ArrowRight className="h-4 w-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Menu navigasi"
                        aria-expanded={open}
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`grid overflow-hidden transition-all md:hidden ${
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <div className="min-h-0">
                        <div className="space-y-1 border-t border-slate-100 px-4 py-3">
                            {LINKS.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <div className="flex gap-2 pt-2">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white"
                                    >
                                        Ke Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                                        >
                                            Daftar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-slate-50/60">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                <GraduationCap className="h-5 w-5" />
                            </span>
                            <span className="text-[15px] font-extrabold">LMS Kampus</span>
                        </div>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                            Platform pembelajaran kampus — kelola kelas, materi, diskusi,
                            dan meeting video WebRTC dalam satu tempat yang cepat dan
                            responsif di semua perangkat.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                                ● Server aktif
                            </span>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                                WebRTC • LiveKit
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold">Produk</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-500">
                            <li><a href="#fitur" className="hover:text-indigo-700">Fitur</a></li>
                            <li><a href="#cara" className="hover:text-indigo-700">Cara pakai</a></li>
                            <li><a href="#akun-demo" className="hover:text-indigo-700">Akun demo</a></li>
                            <li><a href="#faq" className="hover:text-indigo-700">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-sm font-bold">Mulai</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-500">
                            <li><Link href="/login" className="hover:text-indigo-700">Masuk</Link></li>
                            <li><Link href="/register" className="hover:text-indigo-700">Daftar gratis</Link></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-700">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-100">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
                        <p>© 2026 LMS Kampus. Dibuat untuk pembelajaran.</p>
                        <p>Kelas • Materi • Diskusi • Meeting WebRTC</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

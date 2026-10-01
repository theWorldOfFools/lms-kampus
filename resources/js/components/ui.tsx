import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Kartu statistik dashboard.
export function StatCard({
    icon: Icon,
    label,
    value,
    tone = 'indigo',
    hint,
}: {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
    hint?: string;
}) {
    const tones: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        rose: 'bg-rose-100 text-rose-700',
        sky: 'bg-sky-100 text-sky-700',
        violet: 'bg-violet-100 text-violet-700',
    };
    return (
        <div className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
                <span className={`rounded-2xl p-2.5 transition group-hover:scale-110 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
                <p className="min-w-0 truncate text-[13px] font-semibold text-slate-500">{label}</p>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
            {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

// Kartu section dengan judul + aksi opsional.
export function SectionCard({
    title,
    subtitle,
    action,
    children,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="h-full rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

// Label kecil berwarna.
export function Badge({
    tone = 'slate',
    children,
}: {
    tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
    children: ReactNode;
}) {
    const tones: Record<string, string> = {
        slate: 'bg-slate-100 text-slate-600',
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        rose: 'bg-rose-100 text-rose-700',
        sky: 'bg-sky-100 text-sky-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}

// Status kosong yang ramah.
export function EmptyState({
    icon: Icon,
    title,
    hint,
    action,
}: {
    icon: LucideIcon;
    title: string;
    hint?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-4 py-10 text-center ring-1 ring-slate-100">
            <span className="rounded-2xl bg-white p-3 text-slate-400 shadow-sm">
                <Icon className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-700">{title}</p>
            {hint && <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">{hint}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// Avatar bulat dari inisial nama.
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    const cls =
        size === 'sm'
            ? 'h-8 w-8 text-xs'
            : 'h-10 w-10 text-sm';
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white ${cls}`}
        >
            {initial}
        </span>
    );
}

// Tombol utama / sekunder yang konsisten.
export function PrimaryButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 ${props.className ?? ''}`}
        >
            {children}
        </button>
    );
}

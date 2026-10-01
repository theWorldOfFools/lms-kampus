import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';

createInertiaApp({
    title: (title) => (title ? `${title} — LMS Kampus` : 'LMS Kampus'),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: (props: unknown) => ReactNode }>('./Pages/**/*.tsx', { eager: true });
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Halaman Inertia tidak ditemukan: ./Pages/${name}.tsx`);
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4f46e5',
    },
});

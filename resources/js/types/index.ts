import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface User {
    id: number;
    name: string;
    email: string;
    nim_nidn: string | null;
    role: 'admin' | 'dosen' | 'mhs';
}

export interface PageProps extends InertiaPageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

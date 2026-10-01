export interface Dosen {
    id: number;
    name: string;
    email?: string;
}

export interface Course {
    id: number;
    code: string;
    name: string;
    description: string | null;
    sks: number;
    dosen_id: number;
    dosen?: Dosen;
    semester: string;
    academic_year: string;
    class_code: string;
    is_active: boolean;
    students_count?: number;
}

export interface Material {
    id: number;
    course_id: number;
    title: string;
    body: string | null;
    type: 'file' | 'link' | 'video' | 'doc';
    file_path: string | null;
    link_url: string | null;
    published_at: string | null;
    author?: { id: number; name: string };
}

export interface DiscussionReply {
    id: number;
    body: string;
    created_at: string;
    user: { id: number; name: string; role: string };
}

export interface Discussion {
    id: number;
    body: string;
    created_at: string;
    user: { id: number; name: string; role: string };
    replies: DiscussionReply[];
}

export interface EnrolledStudent {
    id: number;
    status: string;
    student: { id: number; name: string; nim_nidn: string | null };
}

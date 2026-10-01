export interface MeetingCourse {
    id: number;
    code: string;
    name: string;
}

export interface Meeting {
    id: number;
    course_id: number | null;
    title: string;
    description: string | null;
    room_name: string;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    created_by: number;
    is_active: boolean;
    course?: MeetingCourse | null;
    creator?: { id: number; name: string } | null;
}

export interface MeetingTurn {
    urls: string[];
    username: string;
    credential: string;
    expires_at: string;
}

export interface MeetingLivekit {
    url: string;
    wsUrl: string;
    room: string;
    token: string;
    identity: string;
    turn: MeetingTurn | null;
}

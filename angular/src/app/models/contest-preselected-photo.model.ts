export interface PreseleccionJudgeVote {
    user_id: number;
    username?: string | null;
    name?: string | null;
    last_name?: string | null;
    vote: 'aceptar' | 'rechazar';
}

export interface ContestPreselectedPhoto {
    id?: number;
    contest_id: number;
    image_id: number;
    preselected?: boolean;
    votes?: number[];
    vote_count?: number;
    accept_count?: number;
    reject_count?: number;
    my_vote?: 'aceptar' | 'rechazar' | null;
    judge_votes?: PreseleccionJudgeVote[];
    image?: any;
}

export interface ContestCurrentPhotoImage {
    image_id: number;
    code: string;
    title: string;
    url: string;
    section_id: number;
}

export interface ContestCurrentPhoto {
    contest_id: number;
    current_photo: ContestCurrentPhotoImage | null;
    judged_count: number;
    total_count: number;
    remaining_count: number;
    all_judged: boolean;
}

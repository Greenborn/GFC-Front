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
    image?: any;
}

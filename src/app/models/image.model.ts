import { Profile } from "./profile.model";

export interface Image {
    id?: number;
    code: string;
    title: string;
    profile_id: number;
    url?: string;
}

export interface ImageExpanded extends Image {
    profile?: Profile
}
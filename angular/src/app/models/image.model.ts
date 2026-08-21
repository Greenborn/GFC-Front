import { ProfileExpanded } from "./profile.model";

export interface Image {
    id?: number;
    code: string;
    title: string;
    profile_id: number;
    url: string;
    thumbnail?: string;
    photo_base64?: any;
}

export interface ImageExpanded extends Image {
    profile?: ProfileExpanded
}
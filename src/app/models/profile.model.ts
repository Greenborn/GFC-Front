import { Fotoclub } from "./fotoclub.model";
import { User } from "./user.model";

export interface Profile {
    id?: number;
    name: string;
    last_name: string;
    fotoclub_id: number;
    img_url?: string;
    executive?: number;
    executive_rol?: string;
}

export interface ProfileExpanded extends Profile {
    "user"?: User,
    "fotoclub"?: Fotoclub
}
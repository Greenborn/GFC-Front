
import { ProfileExpanded } from "./profile.model";
import { Role } from "./role.model";

export interface User {
    id?: number;
    username: string;
    password?: string;
    role_id: number;
    profile_id: number;
    email?: string;
    passwordRepeat?: string;
    role?: Role;
    dni?: string;
}
export interface UserLogged extends User {
    profile: ProfileExpanded,
    role: Role
}
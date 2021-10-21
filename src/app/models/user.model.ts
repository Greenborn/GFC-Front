
import { ProfileExpanded } from "./profile.model";
import { Role } from "./role.model";

export interface User {
    id?: number;
    username: string;
    password?: string;
    role_id: number;
    profile_id: number;
}
export interface UserLogged extends User {
    profile: ProfileExpanded,
    role: Role
}
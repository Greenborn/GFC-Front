import { ProfileExpanded } from "./profile.model";

export interface ProfileContest {
    id?: number;
    profile_id: number;
    contest_id: number;
    category_id: number;
}

export interface ProfileContestExpanded extends ProfileContest {
    profile: ProfileExpanded
}
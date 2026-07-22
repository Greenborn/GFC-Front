export interface ContestJudge {
  id?: number;
  contest_id: number;
  user_id: number;
  created_at?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    profile_id: number;
    profile?: {
      id: number;
      name: string;
      last_name: string;
      img_url?: string;
    };
  };
}

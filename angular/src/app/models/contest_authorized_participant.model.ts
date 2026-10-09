export interface ContestAuthorizedParticipant {
  id?: number;
  contest_id: number;
  last_name?: string;
  first_name?: string;
  dni: string;
  dni_normalized?: string;
  birth_date?: string;
  faculty?: string;
  discipline?: string;
  created_at?: string;
}

export interface ContestAuthorizedParticipantsParseStats {
  total_rows: number;
  valid_rows: number;
  skipped_no_dni: number;
  skipped_duplicate: number;
}

export interface ContestAuthorizedParticipantsParseResult {
  success: boolean;
  rows: ContestAuthorizedParticipant[];
  stats: ContestAuthorizedParticipantsParseStats;
}

export interface ContestAuthorizedParticipantsStatus {
  has_list: boolean;
  count: number;
  uploaded_at: string | null;
}

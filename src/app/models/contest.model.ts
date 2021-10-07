import { ContestResultExpanded } from "./contest_result.model";

export interface Contest {
    id?: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
}

export interface ContestExpanded extends Contest {
    contestResults: ContestResultExpanded[]
}
import { Category } from "./category.model";
import { ContestResultExpanded } from "./contest_result.model";
import { Section } from "./section.model";

export interface Contest {
    id?: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    img_url?: string;
    rules_url?: string;
    active?: boolean;
    countProfileContests?: number;
    countContestResults?: number;
    sections?: Section[];
    categories?: Category[];
}

export interface ContestExpanded extends Contest {
    contestResults: ContestResultExpanded[]
}
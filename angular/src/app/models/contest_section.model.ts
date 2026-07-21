import { Section } from "./section.model";

export interface ContestSection {
    id?: number;
    contest_id: number;
    section_id: number;
}

export interface ContestSectionExpanded extends ContestSection {
    section: Section
}
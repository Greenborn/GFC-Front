import { Category } from "./category.model";

export interface ContestCategory {
    id?: number;
    contest_id: number;
    category_id: number;
}

export interface ContestCategoryExpanded extends ContestCategory {
    category: Category
}
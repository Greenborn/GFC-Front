import { Image, ImageExpanded } from "./image.model"
import { Metric } from "./metric.model";

export interface ContestResult {
    id?: number;
    contest_id: number;
    image_id: number;
    metric_id: number;
    section_id: number;
}

export interface ContestResultExpanded extends ContestResult {
    "image": ImageExpanded,
    "metric": Metric,
}
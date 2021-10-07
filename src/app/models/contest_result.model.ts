import { Image } from "./image.model"
import { Metric } from "./metric.model";

export interface ContestResult {
    id?: number;
    contest_id: number;
    image_id: number;
    metric_id: number;
}

export interface ContestResultExpanded extends ContestResult {
    "image": Image,
    "metric": Metric
}
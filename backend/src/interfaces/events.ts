import { Selector } from '.'

export interface IEvaluationRequest {
    selector: Selector;
    cookie_path?: string;
}

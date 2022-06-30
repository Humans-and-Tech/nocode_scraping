import { DataSelector } from './spider'

export enum ScrapingStatus {
    SUCCESS = 'success',
    NO_CONTENT = 'no_content', // there is no error, but no content could be scraped 
    ERROR = 'error',
    ELEMENT_NOT_FOUND = "element_not_found"       // the cookie popup was not found
}

export interface ScrapingResponse {
    screenshot?: string;
    content?: string;
    message?: string;
    status: ScrapingStatus;
    selector?: DataSelector;
}


export interface ScrapingError extends ScrapingResponse {
    message: string;
    status: ScrapingStatus.ERROR | ScrapingStatus.NO_CONTENT | ScrapingStatus.ELEMENT_NOT_FOUND;
    selector: DataSelector
}


export interface IScrapingRequest {
    selector: DataSelector;
    // although sent as type URL
    // the URL arrives stringified
    url: string;
    // optional elements on which to click
    // before scraping the content
    // ex: cookie popup...
    clickBefore?: Array<DataSelector | undefined>;
    useCache?: boolean;
}

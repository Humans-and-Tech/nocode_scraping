import { Data, DataSelector } from './spider';

export enum ScrapingStatus {
    SUCCESS = 'success',
    NO_CONTENT = 'no_content', // there is no error, but no content could be scraped 
    ERROR = 'error',
    ELEMENT_NOT_FOUND = "element_not_found" // the cookie popup was not found
}

export enum GenericResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error', // a backend error
}

export interface IScrapingRequest {
    selector: DataSelector;
    url: URL;
    // optional elements on which to click
    // before scraping the content
    // ex: cookie popup...
    clickBefore?: Array<DataSelector | undefined>;
    useCache?: boolean
}


export interface ScrapingResponse {
    screenshot: string;
    content: string | null;
    message?: unknown;
    status: ScrapingStatus;
    selector: DataSelector;
}

export interface ScrapingError extends ScrapingResponse {
    message: string;
    status: ScrapingStatus.ERROR | ScrapingStatus.NO_CONTENT | ScrapingStatus.ELEMENT_NOT_FOUND;
    selector: DataSelector
}

export interface DataSelectorValidityResponse {
    message?: string;
    selector: DataSelector;
    status: GenericResponseStatus;
}

export interface DataSelectorValidityError extends DataSelectorValidityResponse {
    message: string;
    selector: DataSelector;
    status: GenericResponseStatus.ERROR;
}




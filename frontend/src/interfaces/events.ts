import { Data, DataSelector } from './spider';

export enum ScrapingStatus {
    SUCCESS = 'success',
    NO_CONTENT = 'no_content', // there is no error, but no content could be scraped 
    INVALID_SELECTOR = 'invalid_selector',
    ERROR = 'error',
    ELEMENT_NOT_FOUND = "element_not_found"       // the cookie popup was not found
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
    status: ScrapingStatus.SUCCESS;
    selector: DataSelector;
    clickBefore?: Array<DataSelector | undefined>;
}

export interface ScrapingError {
    message: string;
    status: ScrapingStatus.ERROR | ScrapingStatus.NO_CONTENT | ScrapingStatus.ELEMENT_NOT_FOUND | ScrapingStatus.INVALID_SELECTOR;
    selector: DataSelector
}

/**
 * to be used when the validation services succeeds
 * even if the selector is invalid
 */
export interface DataSelectorValidityResponse {
    selectorErrors?: Array<unknown>;    // the 
    selector: DataSelector;
    status: GenericResponseStatus.SUCCESS;
}

/**
 * to be used when there is a technical error 
 */
export interface DataSelectorValidityError {
    message: string;
    selector: DataSelector;
    status: GenericResponseStatus.ERROR;
}



import { DataSelector } from './spider'

export enum ScrapingStatus {
    SUCCESS = 'success',
    NO_CONTENT = 'no_content', // there is no error, but no content could be scraped 
    ERROR = 'error',
    NO_POPUP = "no_popup"       // the cookie popup was not found
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
    status: ScrapingStatus.ERROR | ScrapingStatus.NO_CONTENT | ScrapingStatus.NO_POPUP;
    selector: DataSelector
}

export interface IScrapingRequest {
    selector: DataSelector;
    // although sent as type URL
    // the URL arrives stringified
    url: string;
    // a selector to close a popup
    // before scraping a content
    // in particular cookie pop-ups are a pain 
    // and disturb when taking screenshots
    popupSelector?: DataSelector;
    useCache?: boolean;
}
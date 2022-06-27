import { DataSelector } from './spider';

export enum ScrapingStatus {
    SUCCESS = 'success',
    NO_CONTENT = 'no_content', // there is no error, but no content could be scraped 
    ERROR = 'error'
}

export interface IScrapingRequest {
    selector: DataSelector;
    url: URL;
    cookie_path?: string;
}


export interface ScrapingResponse {
    screenshot: string;
    content: string | null;
    message?: unknown;
    status: ScrapingStatus;
}


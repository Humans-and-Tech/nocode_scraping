import { DataSelector } from './spider'

export interface IScrapingRequest {
    selector: DataSelector;
    url: URL;
    cookie_path?: string;
}


export interface ScrapingResponse {
    screenshot: string;
    content: string | null;
    message?: unknown;
}


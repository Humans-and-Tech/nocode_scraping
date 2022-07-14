import { DataSelector } from './spider';

export enum ScrapingStatus {
  SUCCESS = 'success',
  NO_CONTENT = 'no_content', // there is no error, but no content could be scraped
  INVALID_SELECTOR = 'invalid_selector',
  ERROR = 'error',
  ELEMENT_NOT_FOUND = 'element_not_found' // the cookie popup was not found
}

export interface IScrapingRequest {
  selector: DataSelector;
  url: URL;
  // optional elements on which to click
  // before scraping the content
  // ex: cookie popup...
  clickBefore?: Array<DataSelector | undefined>;
  useCache?: boolean;
  userId: 0;
}

export interface WebPage {
  content: string;
  url: URL;
  isCached: boolean;
  lastScrapedDate: Date;
}

export interface ScrapingResponse {
  screenshot: string;
  content: string | null;
  status: ScrapingStatus.SUCCESS;
  selector: DataSelector;
  clickBefore?: Array<DataSelector | undefined>;
  parentPage: WebPage;
}

export interface ScrapingError {
  message?: string;
  status:
    | ScrapingStatus.ERROR
    | ScrapingStatus.NO_CONTENT
    | ScrapingStatus.ELEMENT_NOT_FOUND
    | ScrapingStatus.INVALID_SELECTOR;
  selector: DataSelector;
}

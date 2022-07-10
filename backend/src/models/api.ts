import { DataSelector } from '.';

export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error'
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
  userId: number;
  organizationName: string;
}

export interface IWebSocketResponse {
  status: ResponseStatus;
  message?: string;
  data: unknown;
}



import { DataSelector, ScrapingStatus } from './core';

export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * the shape of an incoming request (via websocket of REST API)
 */
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

export interface IResponse {
  status: ResponseStatus;
  message?: string;
}

/**
 * the shape of a response to a websocket client
 */
export interface IScrapingResponse {
  status: ScrapingStatus;
  message?: string;
  data?: unknown;
  selector?: DataSelector;
}


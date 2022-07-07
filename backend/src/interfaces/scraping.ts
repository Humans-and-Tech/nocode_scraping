import { DataSelector } from '../models';


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

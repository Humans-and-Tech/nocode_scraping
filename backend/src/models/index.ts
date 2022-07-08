import { Page } from 'playwright-chromium';

export enum ScrapingStatus {
  SUCCESS = 'success',
  NO_CONTENT = 'no_content', // there is no error, but no content could be scraped
  INVALID_SELECTOR = 'invalid_selector',
  ERROR = 'error',
  ELEMENT_NOT_FOUND = 'element_not_found' // the cookie popup was not found
}

export enum GenericResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error' // a backend error
}

export enum SelectorStatus {
  VALID = 'valid',
  INVALID = 'invalid'
}

export class DataSelector {
  path: string | undefined;
  language?: 'css' | 'xpath' | 'jsonld' | 'js';
  status?: SelectorStatus;

  constructor(path: string | undefined, language?: string, status?: SelectorStatus) {
    this.path = path;
    this.language = 'css';
    this.status = status;
  }
}

export class WebPage {
  content: string;
  url: URL;
  isCached: boolean;
  lastScrapedDate: Date;

  constructor(url: URL, content: string, isCached: boolean, lastScrapedDate: Date) {
    this.url = url;
    this.content = content;
    this.isCached = isCached;
    this.lastScrapedDate = lastScrapedDate;
  }
}

export class ScrapedContent {
  screenshot: string;
  content: string | null;
  selector: DataSelector;
  clickBefore?: Array<DataSelector | undefined>;
  status: ScrapingStatus;
  parentPage: WebPage;

  constructor(
    parentPage: WebPage,
    content: string | null,
    selector: DataSelector,
    screenshot: string,
    clickBefore?: Array<DataSelector | undefined>
  ) {
    this.parentPage = parentPage;
    this.content = content;
    this.selector = selector;
    this.screenshot = screenshot;
    this.clickBefore = clickBefore;
    this.status = ScrapingStatus.SUCCESS;
  }
}

export class DataSelectorValidityResponse {
  selectorErrors?: Array<unknown>;
  selector: DataSelector;
  status: GenericResponseStatus;

  constructor(selector: DataSelector, selectorErrors: Array<unknown>) {
    this.selector = selector;
    this.selectorErrors = selectorErrors;
    this.status = GenericResponseStatus.SUCCESS;
  }
}

export type DataSweeperFunction = (input: string, ...args: (string | number | boolean)[]) => string;

export class Data {
  // the name is just a marker
  // of the element to be scraped
  // for example "price" or "stock"
  name: string;
  label?: string;
  type?: string | number | boolean;
  selector?: DataSelector;
  // optional elements on which to click
  // before scraping the content
  // ex: cookie popup...
  isPopup?: boolean;
  popupSelector?: DataSelector;
  sweepers?: Set<DataSweeperFunction>;

  constructor(
    name: string,
    label?: string,
    type?: string | number | boolean,
    selector?: DataSelector,
    isPopup?: boolean,
    popupSelector?: DataSelector,
    sweepers?: Set<DataSweeperFunction>
  ) {
    this.name = name;
    this.label = label;
    this.type = type;
    this.selector = selector;
    this.isPopup = isPopup;
    this.popupSelector = popupSelector;
    this.sweepers = sweepers;
  }
}

/**
 * an exportItem modelizes the way the data are going to be exported
 * for the user
 */
export interface ExportItem {
  name: string;
  dataSet: Set<Data>;
}

export enum PageType {
  ProductSheet = 'ProductSheet',
  CategoryPage = 'CategoryPage'
}

export interface Website {
  name?: string;
  baseUrl?: URL;
}

export interface Spider {
  name: string;
  website?: Website;
  data?: Set<Data>;
  pipelines?: Set<ExportPipeline>;
  urlSet?: Set<URL>;
  pageType?: PageType;
  items?: Set<ExportItem>;
  settings?: Settings; // will be typed later
  headers?: unknown;
  cookies?: unknown;

  // to configure the spider (data selectors...)
  // sample of URLs are required
  // for instance, you can't validate a selector
  // without a sample page
  sampleURLs?: Array<URL>;
}

/**
 * the configuration of an exporter
 * it can be the configuration of RabbitMQ, Pub/Sub/Google Buckets
 * or any 3-part system to which we'll send `ExportItem`
 */
export interface ExportPipeline {
  [key: string]: unknown;
}

export interface Settings {
  proxy: unknown;
}

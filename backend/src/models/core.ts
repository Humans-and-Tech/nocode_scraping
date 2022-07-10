import { Storable } from './db';

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

export type Class<T> = new (...args: any[]) => T;

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

export class Data implements Storable {
  key: string;
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
    this.key = name;
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
export class ExportItem {
  name: string;
  dataSet: Set<Data>;
}

export enum PageType {
  ProductSheet = 'ProductSheet',
  CategoryPage = 'CategoryPage'
}

export class Website {
  name?: string;
  baseUrl?: URL;
}

export interface ISpider {
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

export class Spider implements Storable, ISpider {
  key: string;
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

  constructor(obj: ISpider) {
    const { name, website, sampleURLs, urlSet, pageType, data, pipelines, items, settings, headers, cookies } = obj;

    // the key is the spider name
    // acts as a storage id
    this.key = name;
    this.name = name;
    this.website = website;
    this.sampleURLs = sampleURLs;
    this.urlSet = urlSet;
    this.pageType = pageType;
    this.data = data;
    this.pipelines = pipelines;
    this.items = items;
    this.settings = settings;
    this.headers = headers;
    this.cookies = cookies;
  }
}

/**
 * the configuration of an exporter
 * it can be the configuration of RabbitMQ, Pub/Sub/Google Buckets
 * or any 3-part system to which we'll send `ExportItem`
 */
export interface ExportPipeline {
  [key: string]: unknown;
}

export class Settings {
  proxy: unknown;
}

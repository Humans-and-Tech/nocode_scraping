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

export class ScrapedContent {
  screenshot: string;
  content: string | null;
  selector: DataSelector;
  clickBefore?: Array<DataSelector | undefined>;
  status: ScrapingStatus;

  constructor(
    content: string | null,
    selector: DataSelector,
    screenshot: string,
    clickBefore?: Array<DataSelector | undefined>
  ) {
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

export interface Item {
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
  pipelines?: Set<Pipeline>;
  urlSet?: Set<URL>;
  pageType?: PageType;
  items?: Set<Item>;
  settings?: Settings; // will be typed later
  headers?: unknown;
  cookies?: unknown;

  // to configure the spider (data selectors...)
  // sample of URLs are required
  // for instance, you can't validate a selector
  // without a sample page
  sampleURLs?: Array<URL>;
}

export interface Pipeline {
  [key: string]: unknown;
}

export interface Settings {
  proxy: unknown;
}

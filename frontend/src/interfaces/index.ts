export interface ScrapingResponse {
  screenshot: string;
  content: string | null;
  message?: unknown;
}

export enum PageType {
  ProductSheet = 'ProductSheet',
  CategoryPage = 'CategoryPage'
}

export interface ScrapingConfig {
  websiteConfig: WebsiteConfig;
  pageType?: PageType | undefined;
  pageUrl?: string;
}

export interface WebsiteConfig {
  name?: string;
  // proxy is usually a JSON object 
  // very depending on the 
  // proxy provider, and depending 
  // on the scraping system (scrapy, ...)
  // let's stringify it by simplicity
  proxy?: string;
}

export interface ScrapingElement {
  // the name is just a marker 
  // of the element to be scraped
  // for example "price" or "stock"
  name: string | undefined;
  label?: string;
}

export interface Selector {
  url?: string;     // the url to which this selector applies
  element: ScrapingElement;
  path?: string;    // the css path to select this element
  language?: "css"; // xpath not supported yet
}


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
  name: string | undefined;
  label?: string;
}

export interface Selector {
  url: string;
  element: ScrapingElement;
  path: string;
  language?: "css" | "xpath";
}


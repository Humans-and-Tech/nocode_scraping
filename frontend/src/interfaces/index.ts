export enum PageType {
  ProductSheet = 'ProductSheet',
  CategoryPage = 'CategoryPage'
}

export interface WebsiteConfig {
  url: string;
  // proxy is usually a complex JSON object in scrapy
  // very dependant from the proxy provider
  // let's stringify it by simplicity
  proxy: string;
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


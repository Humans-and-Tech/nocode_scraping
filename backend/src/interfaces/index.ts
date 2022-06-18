export interface Organization {
    // TODO : this will modelize
    // an organization to which the user belongs
    // id: string;
    // name: string;
}

export enum UserRole {
    // TODO
}

export interface User {
    // TODO
    // a user will belong to an org
    // id: string;
    // firstName: string;
    // lastName: string;
    // roles: Array<UserRole>;
    // organization: Organization;
}

export interface ScrapingElement {
    name: string | undefined;
    label?: string;
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

interface DeliveryOption {
    mode: string;
    delay: number;
    price: number;
}

export interface Offer {
    gtin?: string;
    sku?: string;
    mpn?: string;
    discount?: boolean;
    recommededPrice?: number;
    originalPrice: number;
    seller?: string;
    deliveryOptions?: Array<DeliveryOption>;
}

export interface Selector {
    url: string;
    element: ScrapingElement;
    path: string;
    language?: "css" | "xpath";
}
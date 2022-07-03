export enum SelectorStatus {
    VALID = 'valid',
    INVALID = 'invalid'
}

export interface DataSelector {
    path: string | undefined;
    language?: 'css' | 'xpath' | 'jsonld' | 'js';
    status?: SelectorStatus;
}

export interface Data {
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
    isPopup: boolean;
    popupSelector?: DataSelector;
    sweepers?: Set<DataSweeperFunction>;
}


/**
 * to sweep data, you must stringify the data
 * and you get it back as a string,
 * then it's up to you to cast it to the desired type
 * 
 * A DataSweeper can be called with an optional param,
 * 
 * Example: the following function replaces commas by dots
 * 
 * MySweeper: DataSweeperFunction = (input, char, replace_by) => {
 *     return input.replace(char, replace_by);
 * }
 * 
 * const cleanData = MySweeper(data, ',', '.');
 */
export type DataSweeperFunction = (input: string, ...args: (string | number | boolean)[]) => string


export interface Item {
    name: string;
    dataSet: Set<Data>
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
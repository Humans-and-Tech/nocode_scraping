import cloneDeep from 'lodash/cloneDeep';
import { GenericResponseStatus } from '.';

export enum SelectorStatus {
  VALID = 'valid',
  INVALID = 'invalid'
}

export interface DataSelector {
  path: string | undefined;
  language?: 'css' | 'xpath' | 'jsonld' | 'js';
  status?: SelectorStatus;
}

export enum DataGroup {
  PRICE = 'price',
  STOCK = 'stock'
}

export type SweeperType = RemoveSweeperType | ReplaceSweeperType | PadSweeperType | RegexSweeperType;

export interface Data {
  // the name is just a marker
  // of the element to be scraped
  // for example "price" or "stock"
  group?: DataGroup;
  name: string;
  label?: string;
  type?: string | number | boolean;
  selector?: DataSelector;
  // optional elements on which to click
  // before scraping the content
  // ex: cookie popup...
  isPopup?: boolean;
  popupSelector?: DataSelector;
  sweepers?: Array<SweeperType | undefined>;
}

/**
 * to be used when the validation services succeeds
 * even if the selector is invalid
 */
export interface DataSelectorValidityResponse {
  selectorErrors?: Array<unknown>; // the
  selector: DataSelector;
  status: GenericResponseStatus.SUCCESS;
}

/**
 * to be used when there is a technical error
 */
export interface DataSelectorValidityError {
  message: string;
  selector: DataSelector;
  status: GenericResponseStatus.ERROR;
}

export enum SweeperFunctionType {
  removeChar = 'removeChar',
  replaceChar = 'replaceChar',
  pad = 'pad',
  regex = 'regex'
}

export interface RemoveSweeperType {
  key: SweeperFunctionType.removeChar;
  params?: {
    charIndex: number;
  };
}

export interface ReplaceSweeperType {
  key: SweeperFunctionType.replaceChar;
  params?: {
    replaced: string;
    replacedBy: string;
  };
}

export interface PadSweeperType {
  key: SweeperFunctionType.pad;
  params?: {
    append: string;
    prepend: string;
  };
}

export interface RegexSweeperType {
  key: SweeperFunctionType.regex;
  params?: {
    regex: string;
  };
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
  data?: Array<Data>;
  pipelines?: Array<Pipeline>;
  urlSet?: Array<URL>;
  pageType?: PageType;
  items?: Array<Item>;
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

/**
 * cares for overriding a spider data with a given Data object
 *
 * makes a deep clone of the spider which is deeply immutable
 *
 * @param s Spider
 * @return a spider object, updated wit the given data
 */
export const mergeSpiderData = (spider: Spider, data: Data): Spider => {
  let existingDataIndex = -1;
  const localSpider = cloneDeep(spider);

  localSpider.data?.forEach((d: Data, index: number) => {
    if (d.name === data.name) {
      existingDataIndex = index;
    }
  });

  if (localSpider.data === undefined) {
    localSpider.data = [];
  }

  // for TS compilation
  if (localSpider.data) {
    if (existingDataIndex === -1) {
      localSpider.data.push(data);
    } else {
      localSpider.data[existingDataIndex] = data;
      console.log('sweepers:', localSpider.data[existingDataIndex].sweepers?.length);
    }
  }

  return localSpider;
};

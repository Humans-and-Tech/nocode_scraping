import { readFile, unlink, access } from 'fs/promises';
import * as playwright from 'playwright-chromium';

import { GenericResponseStatus, SelectorStatus, ScrapedContent } from '../models';
import { ScrapingError, DataSelectorValidityError } from '../errors';
import { getContent, validateSelector, clickElement } from '.';
import { loadPageContentFromCache } from '../cache/firestore';
import {ICachedContent} from '../cache'

// timeout of 10 seconds
// some tests with playwright are long
jest.setTimeout(10000);

/**
 * Mock Playwright
 *
 * NB: we could have used playwright for real during these tests
 * but
 * 1. it would have required pages to be stable, to be sure of the response when calling them, clicking on elements..
 * 2. it would have been slow
 *
 * Therefore we'll mock some playwright functions so that we focus on the logic of the responses sent back to the caller
 *
 */
jest.mock('playwright-chromium', () => ({
  chromium: {
    launch: () => {
      const newContext = () => {
        const newPage = () => {
          const goto = async (url: string) => {
            console.log(`I'm going to ${url}`);
            return Promise.resolve();
          };

          const click = async (path: string) => {
            if (path == '.not-found') {
              return Promise.reject('error');
            }
            console.log(`I clicked ${path}`);
            return Promise.resolve();
          };

          const waitForTimeout = async (t: number) => {
            console.log(`I waited ${t} millisecs`);
            return Promise.resolve();
          };

          const setDefaultTimeout = (t: number) => {
            console.log(`Set the page timeout to ${t} millisecs`);
          };

          const setContent = async (html: string) => {
            console.log('set page content');
            return Promise.resolve();
          };

          const content = async () => {
            console.log('got page content');
            return Promise.resolve('content');
          };

          const locator = (path: string) => {
            const textContent = async () => {
              console.log('textContent at', path);
              if (path == '.no-content') {
                return Promise.reject('error');
              }
              return Promise.resolve(`Hello @ ${path}`);
            };
            const screenshot = async (o: any) => {
              console.log('took a screenshot and saved it loccaly');
              return Promise.resolve();
            };
            return { textContent, screenshot };
          };

          const close = async () => {
            console.log('closed page');
            return Promise.resolve();
          };

          return { goto, click, waitForTimeout, locator, setDefaultTimeout, content, setContent, close };
        };
        return { newPage };
      };

      const close = async () => {
        console.log('closed browser');
        return Promise.resolve();
      };
      return { newContext, close };
    }
  }
}));

/**
 * mock the cache system, we don't really want to use firestore
 */
jest.mock('../cache', () => ({
  loadPageContentFromCache: async (key: string) => {
    console.log('loadPageContentFromCache for ', key);
    return Promise.resolve({
      content: 'bla',
      updateTime: new Date()
    } as ICachedContent);
  }
}));

/**
 * mock the node fs functions
 * we don't really want to read / delete files
 */
jest.mock('fs/promises', () => ({
  readFile: async (location: string) => {
    console.log('read file at ', location);
    return Promise.resolve('bla');
  },
  unlink: async (location: string) => {
    console.log('unlink ', location);
    return Promise.resolve();
  }
}));

describe('Testing validateSelector response', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const testInvalidSelector = {
    path: '1'
  };

  const testErrorSelector = {
    path: undefined
  };

  const testValidSelector = {
    path: '.hey-oh'
  };

  test('when the validation is not successful, but no error is thrown', async () => {
    const resp = await validateSelector(testInvalidSelector);

    // remove the errors messages which are complex and unused
    // don't want to couple the tests with these messages
    // the important is the structure of the rest of the object
    expect(resp.status).toEqual(GenericResponseStatus.SUCCESS);
    expect(resp.selector?.status).toEqual(SelectorStatus.INVALID);
  });

  test('when the validation throws an error', async () => {
    try {
      const resp = await validateSelector(testErrorSelector);
    } catch (err) {
      expect((err as DataSelectorValidityError).status).toEqual(GenericResponseStatus.ERROR);
      expect((err as DataSelectorValidityError).selector?.path).toEqual(undefined);
    }
  });

  test('when the validation is successful', async () => {
    const resp = await validateSelector(testValidSelector);

    // remove the errors messages which are complex and unused
    // don't want to couple the tests with these messages
    // the important is the structure of the rest of the object
    expect(resp.status).toEqual(GenericResponseStatus.SUCCESS);
    expect(resp.selector?.status).toEqual(SelectorStatus.VALID);
  });
});

describe('Testing click Element', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const testClickableElement = {
    path: '.clickable'
  };

  const testInvalidClickableElement = {
    path: '??'
  };

  const testElementNotFound = {
    path: '.not-found'
  };

  test('the click on an element succeeds', async () => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://www.google.fr');
    const result = await clickElement(page, testClickableElement);

    expect(result).toBe(true);
  });

  test('try to click on an invalid element selector', async () => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://www.google.fr');

    await expect(clickElement(page, testInvalidClickableElement)).rejects.toBeInstanceOf(ScrapingError);
  });

  test('try to click on an element which cannot be found', async () => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://www.google.fr');

    await expect(clickElement(page, testInvalidClickableElement)).rejects.toBeInstanceOf(ScrapingError);
    // mocking the playwright.errors.TimeoutError is difficult
    // because playwright is mocked
    // TODO : later
  });
});

describe('Testing getContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const simpleElementSelector = {
    path: '.content'
  };

  const simpleRequest = {
    selector: simpleElementSelector,
    url: 'http://www.google.fr'
  };

  const noElementSelector = {
    path: '.no-content'
  };

  const noContentFoundRequest = {
    selector: noElementSelector,
    url: 'http://www.google.fr'
  };

  test('a simple scraping that succeeds without popup', async () => {
    await expect(getContent(simpleRequest)).resolves.toBeInstanceOf(ScrapedContent);
  });

  test('no content found', async () => {
    await expect(getContent(noContentFoundRequest)).rejects.toBeInstanceOf(ScrapingError);
  });
});

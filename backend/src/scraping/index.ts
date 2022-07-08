import { readFile, unlink } from 'fs/promises';
import { createHash } from 'crypto';
const config = require('config');

import * as playwright from 'playwright-chromium';
import cssValidator from 'w3c-css-validator';

import { IScrapingRequest } from '../interfaces/scraping';
import { DataSelectorValidityError, ScrapingError } from '../errors';
import {
  ScrapedContent,
  DataSelectorValidityResponse,
  DataSelector,
  SelectorStatus,
  ScrapingStatus,
  GenericResponseStatus,
  WebPage
} from '../models';
import { loadPageContentFromCache, cachePageContent } from '../cache';
import logger from '../logging';

/**
 * validates a selector path
 *
 * If not provided, the default language is 'css'
 *
 * @param selector (DataSelector)
 * @returns a DataSelector completed with the validity status
 */
export const validateSelector = async (
  selector: DataSelector
): Promise<DataSelectorValidityResponse | DataSelectorValidityError> => {
  if (selector.language !== 'css' && selector.language !== undefined) {
    return Promise.reject(
      new DataSelectorValidityError(
        `Unsupported language ${selector.language}, only CSS is currently supported`,
        selector
      )
    );
  }

  /**
   * create a blank rule {}
   * to validate the CSS selector
   * because the lib validates CSS rules; not selectors
   */
  try {
    const result = await cssValidator.validateText(`${selector.path} {}`);
    if (result.valid) {
      selector.status = SelectorStatus.VALID;
    } else {
      selector.status = SelectorStatus.INVALID;
    }
    return Promise.resolve(new DataSelectorValidityResponse(selector, [`error parsing '${selector.path}'`]));
  } catch (err) {
    return Promise.reject(new DataSelectorValidityError(JSON.stringify(err), selector));
  }
};

/**
 * clicks on an HTML Element identified by a `DataSelector`, on a given `playwright.Page`
 *
 * @param page
 * @param selector
 * @returns
 */
export const clickElement = async (page: playwright.Page, selector: DataSelector): Promise<ScrapingError | boolean> => {
  if (selector !== undefined && selector.path !== undefined) {
    if (selector.language !== 'css' && selector.language !== undefined) {
      return Promise.reject(
        new ScrapingError(
          `Unsupported language ${selector.language}, only CSS is currently supported`,
          ScrapingStatus.ERROR,
          selector
        )
      );
    }

    try {
      const validityResponse = await validateSelector(selector);

      if (validityResponse.status === GenericResponseStatus.ERROR) {
        return Promise.reject(
          new ScrapingError(
            `Error validating the selector ${selector}`,
            ScrapingStatus.ERROR,
            validityResponse.selector
          )
        );
      } else if (validityResponse?.selector?.status === SelectorStatus.INVALID) {
        return Promise.reject(
          new ScrapingError(`Invalid selector ${selector}`, ScrapingStatus.INVALID_SELECTOR, validityResponse.selector)
        );
      }
    } catch (err) {
      return Promise.reject(
        new ScrapingError(`Error validating the selector ${selector}`, ScrapingStatus.ERROR, selector)
      );
    }

    try {
      await page.click(selector.path);
      return Promise.resolve(true);
    } catch (err) {
      if (err instanceof playwright.errors.TimeoutError) {
        return Promise.reject(
          new ScrapingError(
            `the selector ${selector.path} could not be found`,
            ScrapingStatus.ELEMENT_NOT_FOUND,
            selector
          )
        );
      }
      return Promise.reject(
        new ScrapingError(`error ${err} when scraping ${selector.path}`, ScrapingStatus.ERROR, selector)
      );
    }
  }
  return Promise.reject(new ScrapingError(`Undefined selector or selector path`, ScrapingStatus.ERROR, selector));
};

/**
 * Loads the page from a local Cache or from the Web if not cached
 *
 * If the page content is not found in the cache, it is automatically added to the cache
 * so that next time, the page is loaded from the cache
 *
 * @param url: URL
 * @returns Promise<WebPage>
 */
const loadWebPage = async (url: URL): Promise<WebPage> => {
  let isCached = false;
  let lastScrapedDate = new Date();
  let cachedHtml = undefined;

  let browser: playwright.Browser | undefined = undefined;
  let context;
  let page: playwright.Page | undefined = undefined;

  // calculate a hash for the url
  // to retrieve the cached version
  const key = createHash('sha256').update(url.pathname.toString()).digest('hex');

  try {
    const cached = await loadPageContentFromCache(key);

    if (!cached || !cached.content) {
      // store the page content into the cache
      // await cache.set(key, cachedHtml);
      browser = await playwright.chromium.launch();
      context = await browser.newContext();
      page = await context.newPage();
      await page.goto(url.toString());
      cachedHtml = await page.content();
      await cachePageContent(key, cachedHtml);

      await page.close();
      await browser.close();

      logger.info('loaded content from the web, and cached it');
    } else {
      isCached = true;
      lastScrapedDate = cached.updateTime || new Date();
      cachedHtml = cached.content;
      logger.info('loaded content from the cache');
    }

    return Promise.resolve(new WebPage(url, cachedHtml, isCached, lastScrapedDate));
  } catch (error) {
    logger.error(`Error downloading from cache, Downloading content from the web for ${url.toString()}`);
    if (page) {
      try {
        await page.close();
      } catch (err) {
        logger.error(err);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        logger.error(err);
      }
    }
    return Promise.reject(error);
  }
};

/**
 * scrape content on a given URL, with the possibility to click on elements
 * before scraping the content
 *
 * @param req IScrapingRequest
 * @returns  Promise<ScrapedContent | ScrapingError>
 */
export const getContent = async (req: IScrapingRequest): Promise<ScrapedContent | ScrapingError> => {
  // should never occur in reality
  // but required for TS compilation
  if (req === undefined || req.selector === undefined || req.selector.path === undefined) {
    return Promise.reject(new ScrapingError('invalid call', ScrapingStatus.ERROR, undefined));
  }

  try {
    const validityResponse = await validateSelector(req.selector);
    if (validityResponse.status === GenericResponseStatus.ERROR) {
      return Promise.reject(
        new ScrapingError(
          `Error validating the selector ${req.selector}`,
          ScrapingStatus.ERROR,
          validityResponse.selector
        )
      );
    } else if (validityResponse?.selector?.status === SelectorStatus.INVALID) {
      return Promise.reject(
        new ScrapingError(
          `Invalid selector ${req.selector}`,
          ScrapingStatus.INVALID_SELECTOR,
          validityResponse.selector
        )
      );
    }

    // else do nothing thr selector is valid
    // we can go on
  } catch (err) {
    return Promise.reject(new ScrapingError(`invalid selector, ${err}`, ScrapingStatus.ERROR, req.selector));
  }

  // the url arrives as a string
  // but we need to decompose it (for the caching mecanism)
  const _url = new URL(req.url);

  const SCREENSHOTS_DIR = config.get("scraping.screenshotsDir") || '.';
  const baseName = _url.toString().substring(_url.toString().lastIndexOf('/') + 1);
  const screenshotPath = `${SCREENSHOTS_DIR}/${_url.hostname}-${baseName}.png`;

  let browser: playwright.Browser | undefined = undefined;
  let context;
  let page: playwright.Page | undefined = undefined;

  try {
    const webPage = await loadWebPage(_url);

    // now launch a browser to click in it
    // and scrape content
    browser = await playwright.chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    await page.setContent(webPage.content);

    const WAIT=parseInt(config.get("scraping.waitForTimeout")) || 500;
    await page.waitForTimeout(WAIT);

    // eventually click elements
    // before scraping
    if (req.clickBefore) {
      let clickErr;

      // click all elements passed
      // but if an error occurs rethrow it !
      await Promise.all(
        req.clickBefore.map(async (element) => {
          if (element && page) {
            try {
              await clickElement(page, element);
              await page.waitForTimeout(500);
            } catch (err) {
              // err is a scrapingError
              // it contains the Selector which is not valid
              clickErr = err as ScrapingError;
            }
          }
        })
      );

      // the clickErr will be recatched just below
      // thus the promise will be rejected
      if (clickErr) {
        throw clickErr as ScrapingError;
      }
    }

    // fetch content before making a screenshot
    // thus when a timeout is thrown, no file is written on the disk
    const content = await page.locator(req.selector.path).textContent();

    // TODO: externalise the root path
    // to store screenshots
    // convert to base64 to return it to the user
    let imageAsBase64 = '';
    await page.locator(req.selector.path).screenshot({ path: screenshotPath });
    imageAsBase64 = await readFile(screenshotPath, { encoding: 'base64' });
    // remove the screenshot file
    await unlink(screenshotPath);

    await page.close();
    await browser.close();

    if (content) {
      return Promise.resolve(
        new ScrapedContent(webPage, content, req.selector, `data:image/gif;base64,${imageAsBase64}`)
      );
    } else {
      return Promise.reject(
        new ScrapingError(`no content found for selector ${req.selector.path}`, ScrapingStatus.NO_CONTENT, req.selector)
      );
    }
  } catch (error) {
    // close if not
    if (page) {
      try {
        await page.close();
      } catch (err) {
        logger.error(err);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        logger.error(err);
      }
    }

    // just for testing, we must verifiy the playwright.errors object
    // because during the tests it is mocked and equals undefined
    if (playwright.errors && error instanceof playwright.errors.TimeoutError) {
      return Promise.reject(
        new ScrapingError(
          `the selector ${req.selector.path} could not be found`,
          ScrapingStatus.NO_CONTENT,
          req.selector
        )
      );
    } else {
      // try to unlink the screenshot
      // if it exists in the folder
      try {
        // await access(screenshotPath); // if there is no error, it means that the file exists
        await unlink(screenshotPath);
      } catch (error) {
        // the file does not exist
        // do nothing
      }

      // the error is already a ScrapingError, rethrow it
      if (error instanceof ScrapingError) {
        return Promise.reject(error);
      } else {
        return Promise.reject(
          new ScrapingError(`error ${error} when scraping ${req.selector.path}`, ScrapingStatus.ERROR, req.selector)
        );
      }
    }
  }
};

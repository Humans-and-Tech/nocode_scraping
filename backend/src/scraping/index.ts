import { readFile, unlink, access } from 'fs/promises';
import Cache from "file-system-cache";
import { createHash } from 'crypto';

import * as playwright from 'playwright-chromium';
import cssValidator from 'w3c-css-validator';

import { DataSelector } from '../interfaces/spider';
import { ScrapingResponse, IScrapingRequest, ScrapingStatus, ScrapingError } from '../interfaces/scraping';


const clickPopup = async (page: playwright.Page, selector: DataSelector): Promise<void> => {

    if (selector.path !== undefined) {

        // eliminate the cookie pop-pup
        // if the path is provided, because it may disturb the screenshot capture
        try {
            const isSelectorValid = await validateSelector(selector);
            if (!isSelectorValid) {
                return Promise.reject(`invalid selector ${selector} provided`);
            }
        } catch (err) {
            return Promise.reject(`invalid selector, ${err}`);
        }

        // an error when clicking on the cookie pop up
        // should have no impact on the selection of the data
        // the cookie pop up selector may not be good
        // or the pop-up may not appear
        try {

            await page.click(selector.path);
            await page.waitForTimeout(500);

        } catch (cookiePpErr) {

            if (cookiePpErr instanceof playwright.errors.TimeoutError) {

                return Promise.reject(`the selector ${selector.path} could not be found`);

            } else {

                return Promise.reject(`error ${cookiePpErr} when clicking on ${selector.path}`);
            }
        }
    }
};


/**
 * 
 * @param selector 
 * @returns true|false
 */
export const validateSelector = async (selector: DataSelector): Promise<boolean> => {

    if (selector.language !== 'css') {
        return Promise.reject(`Unsupported language ${selector.language}, only CSS is currently supported`);
    }

    /**
     * create a blank rule {} 
     * to validate the CSS selector
     * because the lib validates the rules; not only a selector
     */
    const result = await cssValidator.validateText(`${selector.path} {}`);
    return Promise.resolve(result.valid);
};


/**
 * scrape content on a given URL, with the possibility to eliminate a pop-up
 * that appears in the foreground
 * 
 * @param req IScrapingRequest
 * @returns a Promise of a ScrapingResponse
 */
export const getContent = async (req: IScrapingRequest): Promise<ScrapingResponse> => {

    if (req.selector === undefined || req.selector.path === undefined) {
        return Promise.reject({
            message: 'no selector provided',
            status: ScrapingStatus.ERROR
        } as ScrapingError);
    }

    // validate selectors provided
    try {
        const isSelectorValid = await validateSelector(req.selector);
        if (!isSelectorValid) {
            return Promise.reject({
                message: `invalid selector ${req.selector} provided`,
                status: ScrapingStatus.ERROR
            } as ScrapingError);
        }
    } catch (err) {
        return Promise.reject({
            message: `invalid selector, ${err}`,
            status: ScrapingStatus.ERROR
        } as ScrapingError);
    }


    // the url arrives as a string
    // but we need to decompose it (for the caching mecanism)
    const _url = new URL(req.url);

    try {

        const browser = await playwright.chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        // short timeout of 1 seconds
        // TODO : configure it externally
        page.setDefaultTimeout(1000);

        let cachedHtml = undefined;
        // calculate a hash for the url
        // to retrieve the cached version
        const key = createHash('sha256').update(_url.pathname.toString()).digest('hex');

        // use a cache for HTML pages
        // downloaded by playwright
        const cache = Cache({
            basePath: "./.cache", // Path where cache files are stored (default).
            ns: _url.hostname // cached files are grouped by hostname
        });

        try {

            console.log('load content with cache key', key);
            cachedHtml = await cache.get(key);

            if (cachedHtml !== undefined) {
                await page.setContent(cachedHtml);
            } else {

                await page.goto(_url.toString());
                cachedHtml = await page.content();

                // store the page content into the cache
                await cache.set(key, cachedHtml);
            }

        } catch (error) {
            return Promise.reject({
                message: error,
                status: ScrapingStatus.ERROR
            } as ScrapingError)
        }

        // await the page to be ready
        // before evaluating the content
        // some JS may need to be executed 
        await page.waitForTimeout(500);

        // close popup if requested
        if (req.popupClosureSelector !== undefined) {
            try {
                await clickPopup(page, req.popupClosureSelector);
            } catch (err) {
                return Promise.reject({
                    message: err,
                    status: ScrapingStatus.NO_POPUP
                } as ScrapingError)
            }
        }

        // fetch content before making a screenshot
        // thus when a timeout is thrown, no file is written on the disk
        const content = await page.locator(req.selector.path).textContent();

        // TODO: externalise the root path
        // to store screenshots
        // convert to base64 to return it to the user
        let imageAsBase64: string = '';
        const baseName = _url.toString().substring(_url.toString().lastIndexOf('/') + 1);
        const screenshotPath = `./${_url.hostname}-${baseName}.png`;

        await page.locator(req.selector.path).screenshot({ path: screenshotPath });
        imageAsBase64 = await readFile(screenshotPath, { encoding: 'base64' });
        // remove the screenshot file
        await unlink(screenshotPath);
        if (content !== null) {
            return Promise.resolve({
                screenshot: `data:image/gif;base64,${imageAsBase64}`,
                content: content,
                status: ScrapingStatus.SUCCESS
            } as ScrapingResponse);
        } else {
            return Promise.reject({
                message: `no content found for selector ${req.selector.path}`,
                status: ScrapingStatus.NO_CONTENT
            } as ScrapingError);
        }

    } catch (error) {

        if (error instanceof playwright.errors.TimeoutError) {

            return Promise.reject({
                message: `the selector ${req.selector.path} could not be found`,
                status: ScrapingStatus.NO_CONTENT
            } as ScrapingError);

        } else {
            // try to unlink the screenshot
            // if it exists in the folder
            try {

                const baseName = _url.toString().substring(_url.toString().lastIndexOf('/') + 1);
                const screenshotPath = `./${_url.hostname}-${baseName}.png`;

                // if there is no error, it means that the file exists
                await access(screenshotPath);
                await unlink(screenshotPath);

            } catch (error) {
                // the file does not exist
                // do nothing
            }

            return Promise.reject({
                message: `error ${error} when clicking on ${req.selector.path}`,
                status: ScrapingStatus.ERROR
            } as ScrapingError);
        }

    }
}


import { readFile, unlink, access } from 'fs/promises';
import Cache from "file-system-cache";
import { createHash } from 'crypto';

import * as playwright from 'playwright-chromium';
import cssValidator from 'w3c-css-validator';

import { DataSelector, SelectorStatus } from '../interfaces/spider';
import { ScrapingResponse, IScrapingRequest, ScrapingStatus, ScrapingError, DataSelectorValidityResponse, DataSelectorValidityError, GenericResponseStatus } from '../interfaces/scraping';


export const isDataSelectorValidityError = (o: DataSelectorValidityResponse): o is DataSelectorValidityError => {
    return ("message" in o && "selector" in o && "status" in o);
}

/**
 * validates a selector path
 * 
 * If not provided, the default language is 'css'
 * 
 * @param selector (DataSelector)
 * @returns a DataSelector completed with the validity status
 */
export const validateSelector = async (selector: DataSelector): Promise<DataSelectorValidityResponse> => {

    if (selector.language !== 'css' && selector.language !== undefined) {
        return Promise.reject(`Unsupported language ${selector.language}, only CSS is currently supported`);
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
        return Promise.resolve({
            selector: selector,
            status: GenericResponseStatus.SUCCESS
        });

    } catch (err) {
        return Promise.reject({
            selector: selector,
            message: err,
            status: GenericResponseStatus.ERROR
        } as DataSelectorValidityError);
    }

};


export const clickElement = async (page: playwright.Page, selector: DataSelector): Promise<ScrapingResponse | void> => {

    if (selector !== undefined && selector.path !== undefined) {

        if (selector.language !== 'css' && selector.language !== undefined) {
            return Promise.reject(
                {
                    message: `Unsupported language ${selector.language}, only CSS is currently supported`,
                    status: ScrapingStatus.ERROR,
                    selector: selector
                } as ScrapingError
            )
        }

        try {
            const validityResponse = await validateSelector(selector);

            if (validityResponse.status === GenericResponseStatus.ERROR) {

                return Promise.reject({
                    message: `Error validating the selector ${selector}`,
                    status: ScrapingStatus.ERROR,
                    selector: validityResponse.selector
                } as ScrapingError);

            } else if (validityResponse.selector.status === SelectorStatus.INVALID) {

                return Promise.reject({
                    message: `Invalid selector ${selector}`,
                    status: ScrapingStatus.ERROR,
                    selector: validityResponse.selector
                } as ScrapingError);
            }

        } catch (err) {

            return Promise.reject({
                message: `invalid selector, ${err}`,
                status: ScrapingStatus.ERROR,
                selector: selector
            } as ScrapingError);
        }

        try {
            await page.click(selector.path);
            await page.waitForTimeout(500);

            // resolve the promise
            // but no need to return anything...
            return Promise.resolve();
        } catch (err) {
            if (err instanceof playwright.errors.TimeoutError) {
                return Promise.reject({
                    message: `the selector ${selector.path} could not be found`,
                    status: ScrapingStatus.ELEMENT_NOT_FOUND,
                    selector: selector
                } as ScrapingError);
            } else {
                return Promise.reject({
                    message: `error ${err} when scraping ${selector.path}`,
                    status: ScrapingStatus.ERROR,
                    selector: selector
                } as ScrapingError);
            }
        }
    }

}

/**
 * scrape content on a given URL, with the possibility to eliminate a pop-up
 * that appears in the foreground
 * 
 * @param req IScrapingRequest
 * @returns a Promise of a ScrapingResponse
 */
export const getContent = async (req: IScrapingRequest): Promise<ScrapingResponse> => {

    // should never occur in reality
    // but required for TS compilation 
    if (req === undefined || req.selector === undefined || req.selector.path === undefined) {
        return Promise.reject({
            message: 'invalid call',
            status: ScrapingStatus.ERROR,
            selector: {
                path: undefined
            }
        } as ScrapingError);
    }

    try {

        const validityResponse = await validateSelector(req.selector);
        if (validityResponse.status === GenericResponseStatus.ERROR) {

            return Promise.reject({
                message: `Error validating the selector ${req.selector}`,
                status: ScrapingStatus.ERROR,
                selector: validityResponse.selector
            } as ScrapingError);

        } else if (validityResponse.selector.status === SelectorStatus.INVALID) {

            return Promise.reject({
                message: `Invalid selector ${req.selector}`,
                status: ScrapingStatus.ERROR,
                selector: validityResponse.selector
            } as ScrapingError);
        }

    } catch (err) {

        return Promise.reject({
            message: `invalid selector, ${err}`,
            status: ScrapingStatus.ERROR,
            selector: req.selector
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

            cachedHtml = await cache.get(key);

            if (cachedHtml !== undefined) {
                console.log('Using cached content for key', key);
                await page.setContent(cachedHtml);
            } else {
                console.log('Downloading content from the web for key', key);
                await page.goto(_url.toString());
                cachedHtml = await page.content();

                // store the page content into the cache
                await cache.set(key, cachedHtml);
            }

        } catch (error) {
            return Promise.reject(
                {
                    message: error,
                    status: ScrapingStatus.ERROR,
                    selector: req.selector
                } as ScrapingError
            );
        }

        // await the page to be ready
        // before evaluating the content
        // some JS may need to be executed 
        await page.waitForTimeout(500);

        // eventually click elements 
        // before scraping
        if (req.clickBefore) {
            try {
                req.clickBefore.forEach(async (element) => {
                    if (element) {
                        try {
                            await clickElement(page, element);
                        } catch (err) {
                            Promise.reject(
                                {
                                    message: JSON.stringify(err),
                                    status: ScrapingStatus.ERROR,
                                    selector: req.selector
                                } as ScrapingError
                            );
                        }

                    }
                });
            } catch (err) {
                Promise.reject(
                    {
                        message: JSON.stringify(err),
                        status: ScrapingStatus.ERROR,
                        selector: req.selector
                    } as ScrapingError
                );
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
            return Promise.resolve(
                {
                    screenshot: `data:image/gif;base64,${imageAsBase64}`,
                    content: content,
                    status: ScrapingStatus.SUCCESS
                } as ScrapingResponse
            );
        } else {
            return Promise.reject(
                {
                    message: `no content found for selector ${req.selector.path}`,
                    status: ScrapingStatus.NO_CONTENT,
                    selector: req.selector
                } as ScrapingError
            );
        }

    } catch (error) {

        if (error instanceof playwright.errors.TimeoutError) {

            return Promise.reject(
                {
                    message: `the selector ${req.selector.path} could not be found`,
                    status: ScrapingStatus.NO_CONTENT,
                    selector: req.selector
                } as ScrapingError
            );

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

            return Promise.reject(
                {
                    message: `error ${error} when scraping ${req.selector.path}`,
                    status: ScrapingStatus.ERROR,
                    selector: req.selector
                } as ScrapingError
            );
        }

    }
}


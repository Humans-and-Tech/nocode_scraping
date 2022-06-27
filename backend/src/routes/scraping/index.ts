import { readFile, unlink, access, writeFile } from 'fs/promises';
import Cache from "file-system-cache";
import { createHash } from 'crypto';

import * as playwright from 'playwright-webkit';
import cssValidator from 'w3c-css-validator';
import { DataSelector } from '../../interfaces/spider';

import { ScrapingResponse, IScrapingRequest, ScrapingStatus } from '../../interfaces/events';


function isTypeURL(value: unknown) {
    return value instanceof URL;
}


module.exports = () => {

    /**
     * Takes a screenshot of the locator 
     * and evaluates the content of the DOM targeted by the CSS selector
     * 
     * @param selector 
     * @returns a promise of a ScrapingResponse : screenshot + content scraped
     */
    const getContent = async (req: IScrapingRequest, callback: (resp: ScrapingResponse) => void) => {


        if (req.selector === undefined || req.selector.path === undefined) {
            return Promise.reject({
                screenshot: '',
                content: null,
                message: 'no path provided'
            });
        }


        // the url arrives as a string
        // but we need to decompose it for caching
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
                    await writeFile('./test.txt', cachedHtml);
                }

                if (cachedHtml !== undefined) {
                    await page.setContent(cachedHtml);
                } else {
                    console.log("Downloading content from the web");
                    await page.goto(_url.toString());
                    cachedHtml = await page.content();

                    // store the page content into the cache
                    await cache.set(key, cachedHtml);
                }

            } catch (error) {
                console.error("unable to load from cache", error);
            }

            // await the page to be ready
            // before evaluating the content
            // some JS may need to be executed 
            await page.waitForTimeout(500);

            // eliminate the cookie pop-pup
            // if the path is provided, because it may disturb the screenshot capture
            if (req.cookie_path !== undefined && req.cookie_path !== '') {
                // an error when clicking on the cookie pop up
                // should have no impact on the selection of the data
                // the cookie pop up selector may not be good
                // or the pop-up may not appear
                try {
                    console.log('click on cookie pop-up', req.cookie_path);
                    await page.click(req.cookie_path);
                    await page.waitForTimeout(500);
                } catch (cookiePpErr) {
                    if (cookiePpErr instanceof playwright.errors.TimeoutError) {
                        console.log("The cookie pop up didn't appear !");
                    } else {
                        console.error("Unknown error when clicking on the cookie pop up", cookiePpErr);
                    }
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

            console.log('scraped content', content);

            callback({
                screenshot: `data:image/gif;base64,${imageAsBase64}`,
                content: content,
                status: ScrapingStatus.SUCCESS
            });

        } catch (error) {

            console.log("catched error", error);

            if (error instanceof playwright.errors.TimeoutError) {

                console.log("this is a timeout error");

                callback({
                    screenshot: '',
                    content: null,
                    status: ScrapingStatus.NO_CONTENT
                });

            } else {

                console.log("this is another error");

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

                callback({
                    screenshot: '',
                    content: null,
                    message: error,
                    status: ScrapingStatus.ERROR
                });
            }

        }
    }

    /**
     * 
     * @param selector 
     * @returns true|false
     */
    const validateSelector = async (selector: DataSelector, callback: (resp: boolean) => void) => {

        /**
         * create a blank rule {} 
         * to validate the CSS selector
         * because the lib validates the rules; not only a selector
         */
        const result = await cssValidator.validateText(`${selector.path} {}`);
        return callback(result.valid);
    };

    return {
        getContent,
        validateSelector
    }
}


import { readFile, unlink } from 'fs/promises'
import { webkit } from 'playwright-webkit';
import cssValidator from 'w3c-css-validator';
import { DataSelector } from '../../interfaces/spider'

import { ScrapingResponse, IScrapingRequest } from '../../interfaces/events';


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

        console.log("getContent called with params", req,)

        const browser = await webkit.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        // short timeout of 1 seconds
        // TODO : configure it externally
        page.setDefaultTimeout(1000);
        await page.goto(req.url.toString());

        // await the page to be ready
        // before evaluating the content
        // some JS may need to be executed 
        await page.waitForTimeout(2000);

        // TODO: externalise the root path
        // to store screenshots
        // convert to base64 to return it to the user
        let imageAsBase64: string = '';
        const baseName = req.url.toString().substring(req.url.toString().lastIndexOf('/') + 1);
        const screenshotPath = `./${req.url.hostname}-${baseName}.png`;

        try {

            // eliminate the cookie pop-pup
            // if the path is provided, because it may disturb the screenshot capture
            if (req.cookie_path !== '') {
                console.log('Clicking on the cookie popup with', req.cookie_path);
                await page.click('span.didomi-continue-without-agreeing');
            }

            await page.locator(req.selector.path).screenshot({ path: screenshotPath });
            imageAsBase64 = await readFile(screenshotPath, { encoding: 'base64' });
            // remove the screenshot file
            await unlink(screenshotPath);

        } catch (err) {
            console.error(err);
            imageAsBase64 = '';
        }

        try {
            const content = await page.locator(req.selector.path).textContent();
            callback({
                screenshot: `data:image/gif;base64,${imageAsBase64}`,
                content: content
            });
        } catch (error) {
            callback({
                screenshot: '',
                content: null,
                message: error
            });
        }

    };

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


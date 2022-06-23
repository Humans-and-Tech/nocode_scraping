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
    const getContent = async (req: IScrapingRequest, cookieSelectorPath?: string): Promise<ScrapingResponse> => {

        if (req.selector === undefined || req.selector.path === undefined) {
            return Promise.reject({
                screenshot: '',
                content: null,
                message: 'no path provided'
            });
        }

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
            if (cookieSelectorPath !== undefined && cookieSelectorPath !== null && cookieSelectorPath !== '') {
                console.log('Clicking on the cookie popup with', cookieSelectorPath);
                await page.click('span.didomi-continue-without-agreeing');
            }

            await page.locator(req.selector.path).screenshot({ path: screenshotPath }); //, fullPage: true
            imageAsBase64 = await readFile(screenshotPath, { encoding: 'base64' });
            // remove the screenshot file
            await unlink(screenshotPath);

        } catch (err) {
            console.error(err);
            imageAsBase64 = '';
        }

        try {
            const content = await page.locator(req.selector.path).textContent();
            return Promise.resolve({
                screenshot: `data:image/gif;base64,${imageAsBase64}`,
                content: content
            });
        } catch (error) {
            return Promise.reject({
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
    const validateSelector = async (selector: DataSelector): Promise<boolean | null> => {

        /**
         * create a blank rule {} 
         * to validate the CSS selector
         * because the lib validates the rules; not only a selector
         */
        const result = await cssValidator.validateText(`${selector.path} {}`);
        console.info(`validateSelector ${selector.path}`, result);
        return Promise.resolve(result.valid);
    };

    return {
        getContent,
        validateSelector
    }
}


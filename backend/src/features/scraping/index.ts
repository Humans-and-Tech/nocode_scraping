import { readFile, unlink } from 'fs/promises'
import { URL } from 'url';
import { webkit } from 'playwright-webkit';
import isURL from 'validator/lib/isURL';
import { Selector, ScrapingResponse } from '../../interfaces';

/**
 * Takes a screenshot and evaluates the content of the DOM 
 * targeted by the CSS selector
 * 
 * @param selector 
 * @returns a promise of a ScrapingResponse
 */
export const getContent = async (selector: Selector): Promise<ScrapingResponse> => {

    // prevent from errors that
    // could occur later
    if (!isURL(selector.url)) {
        return Promise.reject({
            screenshot: '',
            content: null,
            message: 'The Selector URL is not a valid URL'
        })
    }

    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // short timeout of 1 seconds
    // TODO : configure it externally
    page.setDefaultTimeout(1000);
    await page.goto(selector.url);

    // await the page to be ready
    // before evaluating the content
    // some JS may need to be executed 
    await page.waitForTimeout(1000);

    // TODO: externalise the root path
    // to store screenshots
    // convert to base64 to return it to the user
    let imageAsBase64: string = '';
    const baseName = selector.url.substring(selector.url.lastIndexOf('/') + 1);
    const urlObject = new URL(selector.url);
    const screenshotPath = `./${urlObject.hostname}-${baseName}.png`;

    try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        imageAsBase64 = await readFile(screenshotPath, { encoding: 'base64' });
        // remove the screenshot file
        await unlink(screenshotPath);
    } catch (err) {
        console.error(err);
    }

    try {
        const content = await page.locator(selector.path).textContent();
        return Promise.resolve({
            screenshot: `data:image/gif;base64,${imageAsBase64}`,
            content: content
        });
    } catch (error) {
        return Promise.reject({
            screenshot: `data:image/gif;base64,${imageAsBase64}`,
            content: null,
            message: error
        });
    }

};
import { webkit } from 'playwright-webkit';
import { Selector } from '../interfaces'

export const getContent = async (selector: Selector): Promise<string | null> => {

    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // timeout of 2 seconds
    // TODO: configure this by env. variable
    page.setDefaultTimeout(2000);

    await page.goto(selector.url);

    try {
        const content = await page.locator(selector.path).textContent();
        return Promise.resolve(content);
    } catch (error) {
        return Promise.reject(error);
    }

};
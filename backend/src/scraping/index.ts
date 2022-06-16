import { webkit } from 'playwright-webkit';
import { Selector } from '../interfaces'

export const getContent = async (selector: Selector): Promise<string | null> => {

    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(selector.url);

    // TODO
    // handle UnhandledPromiseRejectionWarning: locator.textContent: Timeout 30000ms exceeded.
    // mettre un short timeout 
    // pour revenir rapidos vers le user
    const content = await page.locator(selector.path).textContent();

    console.log(`found ${content} for selector ${selector.path}`);

    return content

};
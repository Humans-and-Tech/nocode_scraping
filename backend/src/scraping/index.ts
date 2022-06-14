import { webkit } from 'playwright-webkit';

/**
 * Get the title of a website by its URL
 * @param url URL of the website we want to get the title from
 * @returns The title as a string
 */
export const getWordFromTarget = async (): Promise<string> => {
    // Browser initializitation
    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to page
    await page.goto('https://scraping-target.niels.codes');
    // Wait one second to ensure everything has loaded in
    await page.waitForTimeout(1000);

    // Get the title element by its CSS selector
    const wordElement = await page.$('#output-element');
    // Extract the inner text from the element
    const word = await wordElement?.innerText()!;
    await browser.close();
    return word;

};
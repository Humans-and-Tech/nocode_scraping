import { webkit } from 'playwright-webkit';
import { JSDOM } from 'jsdom'
import { microdata } from '@cucumber/microdata';
import { Offer } from 'schema-dts';

export const getSelector = async (url: string): Promise<string> => {

    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to page
    await page.goto(url);
    // await page.waitForTimeout(1000);

    const document = await page.content();

    console.log(document);

    const dom = new JSDOM(document);
    const offer = microdata('https://schema.org/Offer', dom.window.document.documentElement) as Offer;

    console.log('offer', offer);

    return '.price';
};
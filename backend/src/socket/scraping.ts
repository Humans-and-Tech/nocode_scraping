

import { DataSelector } from '../interfaces/spider';
import { getContent, validateSelector } from '../scraping';
import { ScrapingError, ScrapingResponse, IScrapingRequest, ScrapingStatus } from '../interfaces/scraping';


function isScrapingError(o: any): o is ScrapingError {
    return 'message' in o && 'status' in o && 'selector' in o;
}

module.exports = () => {

    /**
     * calls the scraping.getContent module function
     * and returns its response as callback param
     * 
     * @param req 
     * @param callback 
     * @returns 
     */
    const scrapeContent = async (req: IScrapingRequest, callback: (resp: ScrapingResponse) => void) => {

        try {

            const response = await getContent(req);
            console.log('scrapeContent', response);
            callback(response);

        } catch (error) {

            if (isScrapingError(error)) {
                callback({
                    message: error.message,
                    status: error.status,
                    selector: error.selector
                });
            } else {
                callback({
                    message: JSON.stringify(error),
                    status: ScrapingStatus.ERROR,
                });
            }
        }
    };


    /**
     * 
     * @param selector 
     * @returns true|false
     */
    const isSelectorValid = async (selector: DataSelector, callback: (resp: boolean) => void) => {

        /**
         * create a blank rule {} 
         * to validate the CSS selector
         * because the lib validates the rules; not only a selector
         */
        const result = await validateSelector(selector);
        return callback(result);
    };

    return {
        scrapeContent,
        isSelectorValid
    }
};






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
    const scrapeContent = async (req: IScrapingRequest, callback: (resp: ScrapingResponse | undefined, error: ScrapingError | undefined) => void) => {

        try {

            const response = await getContent(req);
            callback(response, undefined);

        } catch (error) {

            if (isScrapingError(error)) {
                callback(undefined, {
                    message: error.message,
                    status: error.status,
                    selector: error.selector
                });
            } else {
                callback(undefined, {
                    message: JSON.stringify(error),
                    status: ScrapingStatus.ERROR,
                    selector: req.selector
                });
            }
        }
    };


    /**
     * 
     * @param selector 
     * @returns true|false
     */
    const isSelectorValid = async (selector: DataSelector, callback: (resp: boolean, error: Error | undefined) => void) => {

        /**
         * create a blank rule {} 
         * to validate the CSS selector
         * because the lib validates the rules; not only a selector
         */
        try {

            const result = await validateSelector(selector);
            return callback(result, undefined);

        } catch (error) {
            callback(false, error as Error);
        }
    };

    return {
        scrapeContent,
        isSelectorValid
    }
};




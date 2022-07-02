

import { DataSelector } from '../interfaces/spider';
import { getContent, validateSelector } from '../scraping';
import { ScrapingError, ScrapingResponse, IScrapingRequest, ScrapingStatus, DataSelectorValidityResponse, GenericResponseStatus } from '../interfaces/scraping';


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
    const isSelectorValid = async (selector: DataSelector, callback: (resp: DataSelectorValidityResponse | undefined, error: Error | undefined) => void) => {

        try {

            const validityResponse = await validateSelector(selector);
            return callback(validityResponse, undefined);

        } catch (error) {

            callback(undefined, error as Error);
        }
    };

    return {
        scrapeContent,
        isSelectorValid
    }
};




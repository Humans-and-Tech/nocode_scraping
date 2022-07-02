

import { DataSelector } from '../interfaces/spider';
import { getContent, validateSelector } from '../scraping';
import { ScrapingError, ScrapingResponse, IScrapingRequest, ScrapingStatus, DataSelectorValidityResponse, GenericResponseStatus, DataSelectorValidityError } from '../interfaces/scraping';


function isScrapingError(o: any): o is ScrapingError {
    return 'message' in o && 'status' in o && 'selector' in o && o.status !== ScrapingStatus.SUCCESS;
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
    const scrapeContent = async (req: IScrapingRequest, callback: (resp: ScrapingResponse | ScrapingError) => void) => {

        try {

            const response = await getContent(req);
            callback(response);

        } catch (error) {

            if (isScrapingError(error)) {
                callback({
                    message: error.message,
                    status: error.status,
                    selector: error.selector
                } as ScrapingError);
            } else {
                callback({
                    message: JSON.stringify(error),
                    status: ScrapingStatus.ERROR,
                    selector: req.selector
                } as ScrapingError);
            }
        }
    };


    /**
     * 
     * @param selector 
     * @returns true|false
     */
    const isSelectorValid = async (selector: DataSelector, callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void) => {

        try {

            const validityResponse = await validateSelector(selector);
            return callback(validityResponse);

        } catch (error) {
            callback(error as DataSelectorValidityError);
        }
    };

    return {
        scrapeContent,
        isSelectorValid
    }
};




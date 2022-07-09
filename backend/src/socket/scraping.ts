// import { DataSelector, ScrapedContent, ScrapingStatus, DataSelectorValidityResponse } from '../models';
// import { getContent, validateSelector } from '../scraping';
// import { IScrapingRequest } from '../interfaces/scraping';

// import { ScrapingError, DataSelectorValidityError } from '../errors';

// module.exports = () => {
//   /**
//    * calls the scraping.getContent module function
//    * and returns its response as callback param
//    *
//    * @param req
//    * @param callback
//    * @returns
//    */
//   const scrapeContent = async (req: IScrapingRequest, callback: (resp: ScrapedContent | ScrapingError) => void) => {
//     try {
//       const response = await getContent(req);
//       callback(response);
//     } catch (error) {
//       if (error instanceof ScrapingError) {
//         callback(error);
//       } else {
//         callback({
//           message: JSON.stringify(error),
//           status: ScrapingStatus.ERROR,
//           selector: req.selector
//         } as ScrapingError);
//       }
//     }
//   };

//   /**
//    *
//    * @param selector
//    * @returns true|false
//    */
//   const isSelectorValid = async (
//     selector: DataSelector,
//     callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void
//   ) => {
//     try {
//       const validityResponse = await validateSelector(selector);
//       return callback(validityResponse);
//     } catch (error) {
//       callback(error as DataSelectorValidityError);
//     }
//   };

//   return {
//     scrapeContent,
//     isSelectorValid
//   };
// };

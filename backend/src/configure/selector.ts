import cssValidator from 'w3c-css-validator';
import { Selector } from '../interfaces'

/**
 * 
 * @param selector 
 * @returns true|false
 */
export const validateSelector = async (selector: Selector): Promise<boolean | null> => {

    /**
     * create a blank rule {} 
     * to validate the CSS selector
     * because the lib validates the rules; not only a selector
     */
    const result = await cssValidator.validateText(`${selector.path} {}`);
    console.info(`validateSelector ${selector.path}`, result);
    return result.valid;
};
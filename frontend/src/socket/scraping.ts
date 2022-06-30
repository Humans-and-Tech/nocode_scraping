import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

import { DataSelector } from "../interfaces/spider";
import { IScrapingRequest, ScrapingError, ScrapingResponse } from "../interfaces/events";

/**
 * fetches the content of the css selector and provides it back to the callback function
 * 
 */
export const evaluate = (_socket: Socket, user: unknown, s: DataSelector, url: URL, popupSelector: DataSelector | undefined, callback: (response: ScrapingResponse | undefined, error: ScrapingError | undefined) => void) => {
    const evaluateConfig: IScrapingRequest = {
        'selector': s,
        'url': url,
        'clickBefore': [popupSelector],
        'useCache': true
    }
    _socket.emit('scraping:get-content', evaluateConfig, (response: ScrapingResponse, error: ScrapingError) => {
        console.log('evaluate', response);
        if (error !== undefined) {
            callback(undefined, error);
        } else {
            callback(response, undefined);
        }
    });
};


/**
 * validation of a selector by the backend
 * this backend called is debounced because it takes a bit of time
 * so don't emit a socket message for the backend each time
 * 
 */
export const validateCssSelector = (_socket: Socket, user: unknown, p: DataSelector, callback: (isValid: boolean) => void) => {
    debounce(() => {
        _socket.emit('scraping:validate-css-selector', p, (isValid: boolean) => {
            callback(isValid);
        });
    }, 1000)();
};
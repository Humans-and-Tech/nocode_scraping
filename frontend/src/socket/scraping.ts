import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

import { DataSelector } from "../interfaces/spider";
import { IScrapingRequest, ScrapingError, ScrapingResponse, DataSelectorValidityResponse } from "../interfaces/events";

/**
 * fetches the content of the css selector and provides it back to the callback function
 * 
 */
export const getContent = (_socket: Socket, user: unknown, s: DataSelector, url: URL, popupSelector: DataSelector | undefined, callback: (response: ScrapingResponse | undefined, error: ScrapingError | undefined) => void) => {
    const evaluateConfig: IScrapingRequest = {
        'selector': s,
        'url': url,
        'clickBefore': [popupSelector],
        'useCache': true
    }
    _socket.emit('scraping:get-content', evaluateConfig, (response: ScrapingResponse, error: ScrapingError) => {
        callback(response, error);
    });
};


/**
 * validation of a selector by the backend
 * this backend called is debounced because it takes a bit of time
 * so don't emit a socket message for the backend each time
 * 
 */
export const validateCssSelector = (_socket: Socket, user: unknown, p: DataSelector, callback: (resp: DataSelectorValidityResponse | undefined, error: Error | undefined) => void) => {
    debounce(() => {
        _socket.emit('scraping:validate-css-selector', p, (resp: DataSelectorValidityResponse, error: Error) => {
            callback(resp, error);
        });
    }, 1000)();
};
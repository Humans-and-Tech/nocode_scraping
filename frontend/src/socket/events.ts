import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

import { Spider, DataSelector } from "../interfaces/spider";
import { IScrapingRequest, ScrapingResponse } from "../interfaces/events";

/**
 * debounces a user input before sending the data
 * 
 * @param event 
 * @param data
 */
export const emit = (_socket: Socket, event: string, data: unknown) => {

    // debounce does not work in anonymous functions
    // there is a trick
    // https://thewebdev.info/2022/06/12/how-to-fix-lodash-debounce-not-working-in-anonymous-function-with-javascript/
    debounce(() => {
        _socket.emit(event, data);
    }, 500)();
};

/**
 * debounces a user input before sending the data
 * 
 * @param event 
 * @param data
 */
export const getSpider = (_socket: Socket, user: unknown, name: string, callback: (data: Spider | undefined) => void) => {

    // debounce does not work in anonymous functions
    // there is a trick
    // https://thewebdev.info/2022/06/12/how-to-fix-lodash-debounce-not-working-in-anonymous-function-with-javascript/
    debounce(() => {
        _socket.emit('spider:get', {}, name, (data: Spider | undefined) => {
            callback(data);
        });
    }, 500)();
};


/**
 * 
 * @param _socket 
 * @param user 
 * @param spider 
 * @param callback 
 */
export const saveSpider = (_socket: Socket, user: unknown, spider: Spider, callback: (b: boolean) => void) => {
    debounce(() => {
        _socket.emit('spider:upsert', {}, spider, (resp: boolean) => {
            callback(resp);
        });
    }, 500)();
};



/**
 * fetches the content of the css selector and provides it back to the callback function
 * 
 * @param _socket 
 * @param p a selector containing a URL and path to evaluate a css selector 
 * @param callback a void function containing the content fetched
 */
export const evaluate = (_socket: Socket, user: unknown, s: DataSelector, url: URL, cookiePopupPath: string, callback: (response: ScrapingResponse) => void) => {
    const evaluateConfig: IScrapingRequest = {
        'selector': s,
        'url': url,
        'cookie_path': cookiePopupPath
    }
    _socket.emit('scraping:get-content', evaluateConfig, (response: ScrapingResponse) => {
        callback(response);
    });
};


/**
 * validation of a selector by the backend
 * this backend called is debounced because it takes a bit of time
 * so don't emit a socket message for the backend each time
 * 
 * @param _socket 
 * @param p 
 * @param callback 
 */
export const validateCssSelector = (_socket: Socket, user: unknown, p: DataSelector, callback: (isValid: boolean) => void) => {
    debounce(() => {
        _socket.emit('scraping:validate-css-selector', p, (isValid: boolean) => {
            callback(isValid);
        });
    }, 1000)();
};

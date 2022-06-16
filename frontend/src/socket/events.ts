import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";
import { Selector } from "../interfaces"

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
        console.log("emit", event, data);
    }, 500)();
};


/**
 * 
 * @param _socket 
 * @param p Selector
 * @param callback a void function taking a Selector as param
 */
export const propose = (_socket: Socket, p: Selector, callback: (proposal: Selector) => void) => {
    _socket.emit('propose-selector', p, (proposal: Selector) => {
        callback(proposal);
    });
};


/**
 * fetches the content of the css selector and provides it back to the callback function
 * 
 * @param _socket 
 * @param p a selector containing a URL and path to evaluate a css selector 
 * @param callback a void function containing the content fetched
 */
export const evaluate = (_socket: Socket, p: Selector, callback: (content: string | null) => void) => {
    _socket.emit('get-selector-content', p, (content: string) => {
        callback(content);
    });
};

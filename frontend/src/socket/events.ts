import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

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
 * request the backend to propose an selector
 * for the given element name
 * 
 * @param _socket 
 * @param element 
 * @param callback 
 */
export const propose = (_socket: Socket, name: string, callback: (proposal: string) => void) => {
    _socket.emit('propose-selector', name, (proposal: string) => {
        callback(proposal);
    });
};
import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

import { Spider } from "../interfaces/spider";

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

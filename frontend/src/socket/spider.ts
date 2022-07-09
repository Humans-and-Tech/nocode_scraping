import { Socket } from 'socket.io-client';
import debounce from 'lodash/debounce';

import { Spider } from '../interfaces/spider';

/**
 * debounces a user input before sending the data
 *
 * @param event
 * @param data
 */
export const getSpider = (
  _socket: Socket,
  user: unknown,
  name: string,
  callback: (data: Spider | undefined, error: Error | undefined) => void
) => {
  // debounce does not work in anonymous functions
  // there is a trick
  // https://thewebdev.info/2022/06/12/how-to-fix-lodash-debounce-not-working-in-anonymous-function-with-javascript/
  debounce(() => {
    _socket.emit('get', {}, name, (data: Spider | undefined, error: Error | undefined) => {
      callback(data, error);
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
export const saveSpider = (
  _socket: Socket,
  user: unknown,
  spider: Spider,
  callback: (b: boolean, error: Error | undefined) => void
) => {
  debounce(() => {
    _socket.emit('upsert', {}, spider, (resp: boolean, error: Error | undefined) => {
      callback(resp, error);
    });
  }, 500)();
};

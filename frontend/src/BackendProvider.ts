import { io } from 'socket.io-client';
import debounce from 'lodash/debounce';

import { Spider, DataSelector, DataSelectorValidityResponse, DataSelectorValidityError } from './interfaces/spider';
import { IScrapingRequest, ScrapingError, ScrapingResponse, ScrapingStatus } from './interfaces/scraping';
import { IWebSocketResponse, GenericResponseStatus } from './interfaces';

/**
 * there is one socket per namespace
 * see https://socket.io/fr/docs/v4/namespaces/
 */
const spiderSocket = io('localhost:3001/spider', {
  withCredentials: false,
  extraHeaders: {
    gus: 'token'
  }
});
const scrapingSocket = io('localhost:3001/scraping', {
  withCredentials: false,
  extraHeaders: {
    gus: 'token'
  }
});

export interface ISpiderBackend {
  get: (name: string, callback: (data: Spider | undefined, error: Error | undefined) => void) => void;
  upsert: (spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => void;
  remove: (spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => void;
  create: (name: string) => Spider;
}

export interface IScrapingBackend {
  getContent: (
    user: unknown,
    s: DataSelector,
    url: URL,
    popupSelector: DataSelector | undefined,
    callback: (response: ScrapingResponse | ScrapingError) => void
  ) => void;
  validateSelector: (
    user: unknown,
    p: DataSelector,
    callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void
  ) => void;
}

export interface IBackendServicesProvider {
  spider: ISpiderBackend;
  scraping: IScrapingBackend;
}

interface IGetSpider {
  name: string; // the spidername
  userId: number;
}

interface IUpsertSpider {
  spider: Spider;
  userId: number;
}

/**
 * TODO: complete this check with other props
 * it's quite weak !!
 *
 * @param obj
 * @returns
 */
function isSpider(obj: unknown): obj is Spider {
  return typeof obj === 'object' && obj !== null && 'name' in obj;
}

function spiderBackend(): ISpiderBackend {

  const get = (_name: string, callback: (data: Spider | undefined, error: Error | undefined) => void) => {
    if (_name === '') {
      throw new Error('cannot get a spider with a blank name');
    }
    // debounce does not work in anonymous functions
    // there is a trick
    // https://thewebdev.info/2022/06/12/how-to-fix-lodash-debounce-not-working-in-anonymous-function-with-javascript/
    debounce(() => {
      const params: IGetSpider = {
        name: _name,
        // later
        userId: 0
      };

      spiderSocket.emit('get', params, (resp: IWebSocketResponse) => {
        console.log('got', resp);
        if (resp.status == GenericResponseStatus.ERROR) {
          callback(undefined, new Error(resp.message));
        } else if (isSpider(resp.data)) {
          callback(resp.data as Spider, undefined);
        } else {
          callback(undefined, new Error('Unknown response type'));
        }
      });
    }, 500)();
  };

  /**
   * TODO
   * @param socket
   * @param _name
   * @returns
   */
  const create = (_name: string): Spider => {
    return {
      name: _name
    };
  };

  /**
   * inserts or updates a spider
   *
   * @param _name
   * @returns
   */
  const upsert = (_spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => {
    if (_spider.name === '' || _spider.name === undefined) {
      throw new Error('cannot save a spider with a blank name');
    }

    const params: IUpsertSpider = {
      spider: _spider,
      // later
      userId: 0
    };

    debounce(() => {
      spiderSocket.emit('upsert', params, (resp: IWebSocketResponse) => {
        if (resp.status == GenericResponseStatus.ERROR) {
          callback(false, new Error(resp.message));
        } else if (resp.data) {
          callback(resp.data as boolean, undefined);
        } else {
          console.error('Spider upsert : Undefined response type');
          callback(false, new Error('unknown response type'));
        }
      });
    }, 500)();
  };

  /**
   * TODO
   *
   * @param socket
   * @param spider
   * @param callback
   */
  const remove = (spider: Spider, callback: (b: boolean, error: Error | undefined) => void): void => {
    if (spider.name === '') {
      throw new Error('cannot remove a spider with a blank name');
    }
    // todo
    callback(true, undefined);
  };

  return { get, upsert, remove, create };
}

function scrapingBackend(): IScrapingBackend {
  const getContent = (
    user: unknown,
    s: DataSelector,
    url: URL,
    popupSelector: DataSelector | undefined,
    callback: (response: ScrapingResponse | ScrapingError) => void
  ) => {
    const evaluateConfig: IScrapingRequest = {
      selector: s,
      url: url,
      clickBefore: [popupSelector],
      useCache: true,
      // later
      userId: 0
    };
    scrapingSocket.emit('get-content', evaluateConfig, (resp: IWebSocketResponse) => {
      if (resp.status == GenericResponseStatus.ERROR) {
        callback({
          message: resp.message || '',
          status: ScrapingStatus.ERROR,
          selector: s
        });
      } else {
        callback(resp.data as ScrapingResponse);
      }
    });
  };

  /**
   * validation of a selector by the backend
   * this backend called is debounced because it takes a bit of time
   * so don't emit a socket message for the backend each time
   *
   */
  const validateSelector = (
    user: unknown,
    p: DataSelector,
    callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void
  ) => {
    debounce(() => {
      scrapingSocket.emit('validate-selector', p, (resp: IWebSocketResponse) => {
        if (resp.status == GenericResponseStatus.ERROR) {
          callback({
            message: resp.message || '',
            selector: p,
            status: GenericResponseStatus.ERROR
          });
        } else {
          callback(resp.data as DataSelectorValidityResponse);
        }
      });
    }, 1000)();
  };

  return { getContent, validateSelector };
}

/**
 * export this function for mocking facility in test cases
 * 
 * @returns 
 */
export function useBackend(): IBackendServicesProvider {
  return {
    spider: spiderBackend(),
    scraping: scrapingBackend()
  };
}

export const BackendServicesProvider: IBackendServicesProvider = useBackend();



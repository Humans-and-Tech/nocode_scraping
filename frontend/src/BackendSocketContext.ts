import React from 'react';
import { io } from 'socket.io-client';
import debounce from 'lodash/debounce';

import { DataSelector, DataSelectorValidityResponse, DataSelectorValidityError } from './interfaces/spider';
import { IScrapingRequest, ScrapingError, ScrapingResponse } from './interfaces/scraping';
import { Spider } from './interfaces/spider';

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
  validateCssSelector: (
    user: unknown,
    p: DataSelector,
    callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void
  ) => void;
}

export interface IBackendServicesProvider {
  spider: ISpiderBackend;
  scraping: IScrapingBackend;
}

interface BackendSpiderInterface {
  name: string; // the spidername
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
      const params: BackendSpiderInterface =  {name: _name};
      spiderSocket.emit('get', params, (data: Spider | Error | undefined) => {
        if (isSpider(data)){
          callback(data, undefined);
        } else {
          callback(undefined, data);
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
  const upsert = (spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => {
    if (spider.name === '' || spider.name === undefined) {
      throw new Error('cannot save a spider with a blank name');
    }

    debounce(() => {
      spiderSocket.emit('upsert', {}, spider, (resp: boolean, error: Error | undefined) => {
        callback(resp, error);
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
      useCache: true
    };
    scrapingSocket.emit('scraping:get-content', evaluateConfig, (response: ScrapingResponse | ScrapingError) => {
      callback(response);
    });
  };

  /**
   * validation of a selector by the backend
   * this backend called is debounced because it takes a bit of time
   * so don't emit a socket message for the backend each time
   *
   */
  const validateCssSelector = (
    user: unknown,
    p: DataSelector,
    callback: (resp: DataSelectorValidityResponse | DataSelectorValidityError) => void
  ) => {
    debounce(() => {
      scrapingSocket.emit(
        'scraping:validate-css-selector',
        p,
        (resp: DataSelectorValidityResponse | DataSelectorValidityError) => {
          callback(resp);
        }
      );
    }, 1000)();
  };

  return { getContent, validateCssSelector };
}

function useBackend(): IBackendServicesProvider {
  return {
    spider: spiderBackend(),
    scraping: scrapingBackend()
  };
}

export const BackendServicesProvider: IBackendServicesProvider = useBackend();

export const BackendContext = React.createContext<IBackendServicesProvider>(BackendServicesProvider);

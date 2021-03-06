import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../tests/i18n';
import socketIOClient from 'socket.io-client';
import MockedSocket from 'socket.io-mock';

import {SpiderContext} from '../../BackendContext';
import { SpiderSearch } from './SpiderSearch';

import {SpiderServicesProvider} from '../../BackendProvider';

/**
 * mock socketio
 *
 * /!\ not mocking this part would lead to
 * setImmediate is not defined
 * because it would try to make requests using setImmediate
 */
jest.mock('socket.io-client');

jest.mock('../../BackendProvider', () => ({

  SpiderServicesProvider: {
    get: (_name, callback) => {
      
      const returnValue = {
        'my-spider': {
          name: 'existing spider'
        },
        'new-spider': undefined
      };

      callback(returnValue[_name]);
    }
  }

}));


describe('Search results', () => {
  let socket;

  beforeEach(() => {
    socket = new MockedSocket();
    socketIOClient.mockReturnValue(socket);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('search returns no spider', async () => {
    const onLoadedMock = jest.fn();

    const { queryByTestId } = render(
      <SpiderContext.Provider value={SpiderServicesProvider}>
        <I18nextProvider i18n={i18n}>
          <SpiderSearch onLoaded={onLoadedMock} />
        </I18nextProvider>
      </SpiderContext.Provider>
    );

    const input = queryByTestId('spiderSearchInput');

    // simulate a user input
    // this simulates the fact that no spider exists with this name
    fireEvent.change(input, { target: { value: 'new-spider' } });

    // the link to create a new spider should be displayed
    const createSpiderLink = queryByTestId('spider-no-proposal-found');
    expect(createSpiderLink).toBeInTheDocument();
  });

  test('search returns an existing spider', async () => {
    const onLoadedMock = jest.fn();

    const { queryByTestId } = render(
      <SpiderContext.Provider value={SpiderServicesProvider}>
        <I18nextProvider i18n={i18n}>
          <SpiderSearch onLoaded={onLoadedMock} />
        </I18nextProvider>
      </SpiderContext.Provider>
    );

    const input = queryByTestId('spiderSearchInput');

    // simulate a user input
    // this simulates the fact that no spider exists with this name
    fireEvent.change(input, { target: { value: 'my-spider' } });

    // the link to create a new spider should be displayed
    const selectSpider = queryByTestId('spider-select-proposal');
    expect(selectSpider).toBeInTheDocument();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../tests/i18n';
import socketIOClient from 'socket.io-client';
import MockedSocket from 'socket.io-mock';

import { validateCssSelector } from '../../../socket/scraping';
import { SelectorInput } from './SelectorInput';
import { ScrapingSocketContext } from '../../../socket';

/**
 * mock socketio
 *
 * /!\ not mocking this part would lead to
 * setImmediate is not defined
 * because it would try to make requests using setImmediate
 */
jest.mock('socket.io-client');

/**
 * mock the evaluate function
 * so that it returns a correct ScrapingResponse
 */
jest.mock('../../../socket/scraping', () => ({
  // callback would be a jest mock
  // for example a simple jest.fn()
  validateCssSelector: (socket, {}, s, callback) => {
    // the response can be DataSelectorValidityResponse | DataSelectorValidityError
    const pathToCallback = {
      '.a-good-selector': {
        selector: {
          path: '.a-good-selector',
          status: 'valid'
        },
        status: 'success'
      },

      // a selector which is invalid
      // but no error on the backend side
      '.a-bad-selector': {
        message: 'a message',
        selector: {
          path: '.a-bad-selector',
          status: 'invalid'
        },
        status: 'success'
      },

      // a selector which caused
      // a backend error
      '.a-error-selector': {
        message: 'a message',
        selector: {
          path: '.a-error-selector',
          status: 'invalid'
        },
        status: 'error'
      }
    };
    return callback(pathToCallback[s.path]);
  }
}));

const testSelectorProp = {
  name: 'test-data'
};

describe('onSelectorChange is called when changing the input value', () => {
  let socket;

  beforeEach(() => {
    socket = new MockedSocket();
    socketIOClient.mockReturnValue(socket);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('when the select is valid', async () => {
    // a dummy mock
    // that we'll observe to check the behaviour of
    // the onChange function prop
    const mockOnConchange = jest.fn();

    const { container } = render(
      <SocketContext.Provider value={socket}>
        <I18nextProvider i18n={i18n}>
          <SelectorInput selector={testSelectorProp} onChange={mockOnConchange} />
        </I18nextProvider>
      </SocketContext.Provider>
    );

    // access the textarea input DOM Element
    // and check the data-* attributes
    // which hold the states of the component
    const input = container.querySelector('textarea');

    // simulate a user input
    fireEvent.change(input, { target: { value: '.a-good-selector' } });

    expect(mockOnConchange.mock.calls.length).toBe(1);

    // we test the call to onSelectorChange
    // which calls itself validateSelector
    // which calls itself mockOnConchange
    expect(mockOnConchange.mock.calls[0][0]).toStrictEqual({
      name: 'test-data',
      path: '.a-good-selector',
      status: 'valid'
    });

    // verify the input class of the textarea
    // refetch it
    const input2 = container.querySelector('textarea');
    expect(input2).toHaveClass('success');
  });

  test('when the selector is not valid', async () => {
    // a dummy mock
    // that we'll observe to check the behaviour of
    // the onChange function prop
    const mockOnConchange = jest.fn();

    const { getByTestId, container } = render(
      <SocketContext.Provider value={socket}>
        <I18nextProvider i18n={i18n}>
          <SelectorInput selector={testSelectorProp} onChange={mockOnConchange} />
        </I18nextProvider>
      </SocketContext.Provider>
    );

    // access the textarea input DOM Element
    // and check the data-* attributes
    // which hold the states of the component
    const input = container.querySelector('textarea');

    // simulate a user input
    fireEvent.change(input, { target: { value: '.a-bad-selector' } });

    expect(mockOnConchange.mock.calls.length).toBe(1);

    // we test the call to onSelectorChange
    // which calls itself validateSelector
    // which calls itself mockOnConchange
    expect(mockOnConchange.mock.calls[0][0]).toStrictEqual({
      name: 'test-data',
      path: '.a-bad-selector',
      status: 'invalid'
    });

    // verify the input class of the textarea
    // refetch it
    const input2 = container.querySelector('textarea');
    expect(input2).toHaveClass('error');
  });

  test('when a backend error occurs', async () => {
    // a dummy mock
    // that we'll observe to check the behaviour of
    // the onChange function prop
    const mockOnConchange = jest.fn();

    const { getByTestId, container } = render(
      <SocketContext.Provider value={socket}>
        <I18nextProvider i18n={i18n}>
          <SelectorInput selector={testSelectorProp} onChange={mockOnConchange} />
        </I18nextProvider>
      </SocketContext.Provider>
    );

    // access the textarea input DOM Element
    // and check the data-* attributes
    // which hold the states of the component
    const input = container.querySelector('textarea');

    // simulate a user input
    fireEvent.change(input, { target: { value: '.a-error-selector' } });

    // the mockOnConchange should not have been called
    expect(mockOnConchange).not.toHaveBeenCalled();

    // verify the input class of the textarea
    // refetch it
    const input2 = container.querySelector('textarea');
    expect(input2).toHaveClass('error');

    // a message should be displayed to notify the user
    const span = getByTestId('backend_error');
    expect(span).toBeInTheDocument();
  });
});

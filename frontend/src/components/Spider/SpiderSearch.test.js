
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../tests/i18n';
import socketIOClient from 'socket.io-client';
import MockedSocket from 'socket.io-mock';


import { getSpider } from '../../socket/spider';
import { SpiderSearch } from './SpiderSearch'
import { SocketContext } from '../../socket'


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
jest.mock('../../socket/spider', () => ({

    // callback would be a jest mock
    // for example a simple jest.fn()
    getSpider: (socket, { }, name, callback) => {

        const returnValue = {
            'my-spider': {
                name: 'existing spider'
            },
            'new-spider': undefined
        };



        // mock a ScrapingResponse object
        // made up of content + screenshot 
        return callback(returnValue[name]);
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

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <SpiderSearch onLoaded={onLoadedMock} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        const input = getByTestId('spiderSearchInput');

        // simulate a user input 
        // this simulates the fact that no spider exists with this name
        fireEvent.change(input, { target: { value: 'new-spider' } });

        // the link to create a new spider should be displayed
        const createSpiderLink = getByTestId('spider-no-proposal-found');
        expect(createSpiderLink).toBeInTheDocument();


    });

    test('search returns an existing spider', async () => {

        const onLoadedMock = jest.fn();

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <SpiderSearch onLoaded={onLoadedMock} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        const input = getByTestId('spiderSearchInput');

        // simulate a user input 
        // this simulates the fact that no spider exists with this name
        fireEvent.change(input, { target: { value: 'my-spider' } });

        // the link to create a new spider should be displayed
        const selectSpider = getByTestId('spider-select-proposal');
        expect(selectSpider).toBeInTheDocument();


    });

});



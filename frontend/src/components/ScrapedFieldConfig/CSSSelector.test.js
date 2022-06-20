
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../tests/i18n';
import socketIOClient from 'socket.io-client';
import MockedSocket from 'socket.io-mock';


import { evaluate } from '../../socket/events';
import { CSSSelector } from './CSSelector'
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
jest.mock('../../socket/events', () => ({
    evaluate: (socket, selector, callback) => callback({
        content: 'youhou'
    })
}));

const onConfigured = (selector) => {
    console.log('onConfigured called with param', selector);
};

const onError = () => {
    console.log('onError called');
};

const testSelector = {
    element: {
        'name': 'test-element',
    }
};

const undefinedSelector = undefined;

const pageUrl = 'http://www.google.com';


describe('Test the component initiation', () => {

    let socket;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test('the component is correctly initiated with an undefined selector', async () => {

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={undefinedSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // access the textarea input DOM Element
        // and check the data-* attributes
        // which hold the states of the component
        const input = getByTestId('selectorPathInput');
        expect(input).toHaveAttribute('data-selector-url', pageUrl);

    });

    test('the component is correctly initiated when a selector is passed', async () => {

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // access the textarea input DOM Element
        // and check the data-* attributes
        // which hold the states of the component
        const input = getByTestId('selectorPathInput');
        expect(input).toHaveAttribute('data-selector-url', pageUrl);
        expect(input).toHaveAttribute('data-selector-element-name', testSelector.element.name);
    });

});

describe('Test the action buttons', () => {

    let socket;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('evaluation is enabled when the selector url and CSS path are not blank', async () => {

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        const input = getByTestId('selectorPathInput');

        // simulate a user input 
        fireEvent.change(input, { target: { value: '.a-selector' } });

        const evaluateBtn = getByTestId('evaluate_selector');
        expect(evaluateBtn).toBeEnabled()


    });

    test('CSS validity check is enabled when the CSS path is not blank', async () => {

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        const input = getByTestId('selectorPathInput');

        // simulate a user input 
        fireEvent.change(input, { target: { value: '.a-selector' } });

        const validityBtn = getByTestId('check_validity');
        expect(validityBtn).toBeEnabled();

    });

    test('the bypass switch appears only when the CSS path is not blank', async () => {

        // see https://stackoverflow.com/questions/52783144/how-do-you-test-for-the-non-existence-of-an-element-using-jest-and-react-testing
        // queryBy* queries return the first matching node for a query, and return null if no elements match
        // getBy* throws an error when not finding an elements
        const { queryByTestId, getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // at the beginning the switch button is not there
        const switchBtn = queryByTestId('bypass_evaluation_switch');
        expect(switchBtn).toBeNull();

        // simulate a user input 
        const input = getByTestId('selectorPathInput');
        fireEvent.change(input, { target: { value: '.a-selector' } });

        expect(switchBtn).toBeInTheDocument();

    });

});

describe('Test the callbacks', () => {

    let socket;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('onConfigured callback is called when the evaluation status is successful', async () => {

        // a dummy mock
        // that we'll observe to check the behaviour of 
        // the inner evaluateSelectorPath function
        const mockOnConfigured = jest.fn();

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={mockOnConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // simulate a user input 
        const input = getByTestId('selectorPathInput');
        fireEvent.change(input, { target: { value: '.a-selector' } });

        // simulate click on the evaluate button 
        const btn = getByTestId('evaluate_btn');
        fireEvent.click(btn);

        expect(mockOnConfigured.mock.calls.length).toBe(1);

    });

    test('onConfigured callback is called when the user bypassed the evaluation', async () => {

        // a dummy mock
        // that we'll observe to check the behaviour of 
        // the inner evaluateSelectorPath function
        const mockOnConfigured = jest.fn();

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={mockOnConfigured} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // simulate a user input 
        const input = getByTestId('selectorPathInput');
        fireEvent.change(input, { target: { value: '.a-selector' } });

        // simulate a bypass of the evaluation
        const switchBtn = getByTestId('bypass_evaluation_switch');
        fireEvent.click(switchBtn);

        expect(mockOnConfigured.mock.calls.length).toBe(1);

    });

    test('onError callback is called when the evaluation status is not succesful', async () => {

        // const spy = jest.spyOn(events, 'evaluate').mockImplementation(() => ({
        //     evaluate: (socket, selector, callback) => callback({
        //         // the content being undefined (or null works as well)
        //         // we expect the onError callback to be called
        //         content: undefined
        //     })
        // }));

        evaluate.mockReturnValueOnce((socket, selector, callback) => callback({
            // the content being undefined (or null works as well)
            // we expect the onError callback to be called
            content: undefined
        }));


        // a dummy mock
        // that we'll observe to check the behaviour of 
        // the inner evaluateSelectorPath function
        const mockOnError = jest.fn();

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={onConfigured} onError={mockOnError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // simulate a user input 
        const input = getByTestId('selectorPathInput');
        fireEvent.change(input, { target: { value: '.a-selector' } });

        // simulate click on the evaluate button 
        const btn = getByTestId('evaluate_btn');
        fireEvent.click(btn);

        expect(mockOnError.mock.calls.length).toBe(1);

    });

});

describe('Test the screenshot display', () => {

    let socket;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the screenshot is displayed only when available', async () => {



    });

});



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


describe('Test CSS Selector macroscopic behaviour', () => {

    const testSelector = {
        element: {
            'name': 'test-element',
        }
    };

    const undefinedSelector = undefined;

    const pageUrl = 'http://www.google.com';

    let socket;

    beforeEach(() => {
        socket = new MockedSocket();
        socketIOClient.mockReturnValue(socket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const onConfigured = (selector) => {
        console.log('onConfigured called with param', selector);
    };

    const onError = () => {
        console.log('onError called');
    };


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

    // Rewire the evaluate function 
    // see https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4#:~:text=Mocking%20a%20function%20generally%20is,functions%20in%20a%20module%20file.
    // see https://github.com/speedskater/babel-plugin-rewire
    // see https://jestjs.io/fr/docs/mock-functions
    test('onConfigured callback is called when the evaluation status is successful', async () => {

        const mockCallback = jest.fn();
        evaluate = jest.fn().mockReturnValue('mock full name');

        const { getByTestId } = render(
            <SocketContext.Provider value={socket}>
                <I18nextProvider i18n={i18n}>
                    <CSSSelector selector={testSelector} pageUrl={pageUrl} onConfigured={mockCallback} onError={onError} />
                </I18nextProvider>
            </SocketContext.Provider>
        );

        // simulate a user input 
        const input = getByTestId('selectorPathInput');
        fireEvent.change(input, { target: { value: '.a-selector' } });
        expect(mockCallback.mock.calls.length).toBe(1);

    });

    test('onConfigured callback is called when the user bypassed the evaluation', async () => {



    });

    test('onError callback is called when the evaluation status is not succesful', async () => {



    });

    test('the bypass switch appears only when the CSS path is not blank', async () => {



    });

    test('the screenshot is displayed only when available', async () => {



    });

});




// test('the rendering of the datapanel summary tab', async () => {
    // through this test, we verify as well the getAttributeValueByPath
    // and getAttributeShortName functions
    // by checking the rendered values

    // const { debug } = render(
    //     <I18nextProvider i18n={i18n}>
    //         <DataPanel data={verification_data} summary={summary} />
    //     </I18nextProvider>
    // );

    // just prints the HTML in the console
    // comment or uncomment it
    // debug();

    // the <ul>s container is identified by data-testid="tab-panel"
    // we could also query by role, with getByRole('tabpanel')
    // there are 2 <ul> containing <li> children
    // and one divider <hr/>
    // which makes 3 children
    // expect(screen.getByTestId('tab-panel').children.length).toBe(3);

    // // inspect the 1 <ul> and check its content
    // // there are 3 <li>
    // const firstUL = screen.getByTestId('tab-panel').firstChild;
    // expect(firstUL.nodeType == 'UL');
    // expect(firstUL.children.length).toBe(3);

    // // first child is the organization name
    // const firstUL_firstLi = firstUL.firstChild;
    // expect(firstUL_firstLi.nodeType == 'LI');
    // expect(firstUL_firstLi.textContent).toContain('organization_name');
    // expect(firstUL_firstLi.textContent).toContain('toto');

    // // and so on for the 2nd and 3rd element
    // const firstUL_secondLi = firstUL.children[1];
    // expect(firstUL_secondLi.nodeType == 'LI');
    // expect(firstUL_secondLi.textContent).toContain('country');
    // expect(firstUL_secondLi.textContent).toContain('FRA');

    // const firstUL_thirdLi = firstUL.children[2];
    // expect(firstUL_thirdLi.nodeType == 'LI');
    // expect(firstUL_thirdLi.textContent).toContain('email');
    // expect(firstUL_thirdLi.textContent).toContain('test@test.fr');

    // const hr = screen.getByTestId('tab-panel').children[1];
    // expect(hr.nodeType == 'HR');

    // const secondUL = screen.getByTestId('tab-panel').children[2];
    // expect(secondUL.nodeType == 'UL');

// });
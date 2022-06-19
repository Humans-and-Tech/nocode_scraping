import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../tests/i18n';


import { CSSSelector } from './CSSelector'

/**
 * an object of type Selector 
 */
const selector = {

};

const pageUrl = '';


test('the selector state is initiated when the selector prop is undefined, and its url is populated with the pageUrl', async () => {

    const onConfigured = (selector) => {

    };

    const onError = () => {

    };

    const { debug } = render(
        <I18nextProvider i18n={i18n}>
            <CSSSelector selector={selector} pageUrl={pageUrl} onConfigured={onConfigured} onError={onError} />
        </I18nextProvider>
    );

});

test('evaluation is enabled when the selector url and CSS path are not blank', async () => {



});

test('CSS validity check is enabled when the CSS path is not blank', async () => {



});

test('onConfigured callback is called when the evaluation status is successful', async () => {



});

test('onConfigured callback is called when the user bypassed the evaluation', async () => {



});

test('onError callback is called when the evaluation status is not succesful', async () => {



});

test('the bypass switch appears only when the CSS path is not blank', async () => {



});

test('the screenshot is displayed only when available', async () => {



});




test('the rendering of the datapanel summary tab', async () => {
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
    expect(screen.getByTestId('tab-panel').children.length).toBe(3);

    // inspect the 1 <ul> and check its content
    // there are 3 <li>
    const firstUL = screen.getByTestId('tab-panel').firstChild;
    expect(firstUL.nodeType == 'UL');
    expect(firstUL.children.length).toBe(3);

    // first child is the organization name
    const firstUL_firstLi = firstUL.firstChild;
    expect(firstUL_firstLi.nodeType == 'LI');
    expect(firstUL_firstLi.textContent).toContain('organization_name');
    expect(firstUL_firstLi.textContent).toContain('toto');

    // and so on for the 2nd and 3rd element
    const firstUL_secondLi = firstUL.children[1];
    expect(firstUL_secondLi.nodeType == 'LI');
    expect(firstUL_secondLi.textContent).toContain('country');
    expect(firstUL_secondLi.textContent).toContain('FRA');

    const firstUL_thirdLi = firstUL.children[2];
    expect(firstUL_thirdLi.nodeType == 'LI');
    expect(firstUL_thirdLi.textContent).toContain('email');
    expect(firstUL_thirdLi.textContent).toContain('test@test.fr');

    const hr = screen.getByTestId('tab-panel').children[1];
    expect(hr.nodeType == 'HR');

    const secondUL = screen.getByTestId('tab-panel').children[2];
    expect(secondUL.nodeType == 'UL');

});
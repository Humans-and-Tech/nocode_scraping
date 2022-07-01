
import React from 'react';
import { render, prettyDOM } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../tests/i18n';


import { PreviewContent } from './PreviewContent';


describe('display the correct message', () => {

    test('when the ScrapingStatus is SUCCESS', async () => {

        const testSuccessfulContent = {
            screenshot: 'http://image.org/image.png',
            content: 'hello',
            status: 'success',
            selector: {
                name: 'a-good-selector'
            }
        }

        const { getByTestId, queryByTestId } = render(
            <I18nextProvider i18n={i18n}>
                <PreviewContent content={testSuccessfulContent} />
            </I18nextProvider>
        );

        const message = getByTestId('preview-success-message');
        expect(message).toBeInTheDocument();

        // the Image element of Ant Design
        // generates an image wrapped with a div
        // thus we need to query the <img /> DOM element contained within the getByTestId('preview-screenshot')
        const screenshot = getByTestId('preview-screenshot').querySelector('img');
        expect(screenshot).toHaveAttribute("src", testSuccessfulContent[screenshot]);

        // assert other messages are not present !
        const NO_CONTENT = queryByTestId('preview-no-content-message');
        expect(NO_CONTENT).not.toBeInTheDocument();
        const ELEMENT_NOT_FOUND = queryByTestId('preview-not-found-message');
        expect(ELEMENT_NOT_FOUND).not.toBeInTheDocument();
        const ERROR = queryByTestId('preview-error-message');
        expect(ERROR).not.toBeInTheDocument();
    });

    test('when the ScrapingStatus is NO_CONTENT', async () => {

        const testNotContent = {
            message: 'message',
            status: 'no_content',
            selector: {
                name: 'a-bad-selector'
            }
        }

        const { getByTestId, queryByTestId } = render(
            <I18nextProvider i18n={i18n}>
                <PreviewContent content={testNotContent} />
            </I18nextProvider>
        );

        const message = getByTestId('preview-no-content-message');
        expect(message).toBeInTheDocument();

        // assert other messages are not present !
        const SUCCESS = queryByTestId('preview-success-message');
        expect(SUCCESS).not.toBeInTheDocument();
        const ELEMENT_NOT_FOUND = queryByTestId('preview-not-found-message');
        expect(ELEMENT_NOT_FOUND).not.toBeInTheDocument();
        const ERROR = queryByTestId('preview-error-message');
        expect(ERROR).not.toBeInTheDocument();

    });

    test('when the ScrapingStatus is ELEMENT_NOT_FOUND', async () => {

        const testNotFound = {
            message: 'message',
            status: 'element_not_found',
            selector: {
                name: 'a-bad-selector'
            }
        }

        const { getByTestId, queryByTestId } = render(
            <I18nextProvider i18n={i18n}>
                <PreviewContent content={testNotFound} />
            </I18nextProvider>
        );

        const message = getByTestId('preview-not-found-message');
        expect(message).toBeInTheDocument();

        // assert other messages are not present !
        const SUCCESS = queryByTestId('preview-success-message');
        expect(SUCCESS).not.toBeInTheDocument();
        const NO_CONTENT = queryByTestId('preview-no-content-message');
        expect(NO_CONTENT).not.toBeInTheDocument();
        const ERROR = queryByTestId('preview-error-message');
        expect(ERROR).not.toBeInTheDocument();

    });

    test('when the ScrapingStatus is ERROR', async () => {

        const testError = {
            message: 'message',
            status: 'error',
            selector: {
                name: 'a-bad-selector'
            }
        }

        const { getByTestId, queryByTestId } = render(
            <I18nextProvider i18n={i18n}>
                <PreviewContent content={testError} />
            </I18nextProvider>
        );

        const message = getByTestId('preview-error-message');
        expect(message).toBeInTheDocument();

        // assert other messages are not present !
        const SUCCESS = queryByTestId('preview-success-message');
        expect(SUCCESS).not.toBeInTheDocument();
        const ELEMENT_NOT_FOUND = queryByTestId('preview-not-found-message');
        expect(ELEMENT_NOT_FOUND).not.toBeInTheDocument();
        const NO_CONTENT = queryByTestId('preview-no-content-message');
        expect(NO_CONTENT).not.toBeInTheDocument();

    });

});







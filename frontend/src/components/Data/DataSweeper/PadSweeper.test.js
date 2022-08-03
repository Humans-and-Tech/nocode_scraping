import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';

import i18n from '../../../tests/i18n';
import '../../../tests/mocks/matchMedia';

import {SweeperFunctionType} from '../../../interfaces/spider';
import { PadSweeper } from './PadSweeper';


describe('result is updated and conveyed to the parent', () => {

  const testInitialState = {
      key: SweeperFunctionType.pad,
      params: {
        append: undefined,
        prepend: undefined
      }
    };

  const testData = "hello";

  test('when entering a prefix', () => {

    // a dummy mock
    const mockOnConfigured = jest.fn();
    const expectedValue = 'xhello';

    const { container, getByTestId } = render(

        <I18nextProvider i18n={i18n}>
          <PadSweeper 
            initialState={testInitialState} 
            onConfigured={mockOnConfigured}
            testdata={testData} />
        </I18nextProvider>

    );

    const prependInput = getByTestId('prepend-input');

    // simulate a user input
    fireEvent.change(prependInput, { target: { value: 'x' } });

    const contentAfter = getByTestId('content-after');
    expect(contentAfter).toHaveTextContent(expectedValue);
    expect(mockOnConfigured.mock.calls[0][0]).toStrictEqual(
      {
        key: SweeperFunctionType.pad,
        params: {
          append: undefined,
          prepend: 'x'
        }
      })
    expect(mockOnConfigured.mock.calls[0][1]).toStrictEqual(expectedValue)
    
  });

  test('when entering an suffix', () => {

    // a dummy mock
    const mockOnConfigured = jest.fn();
    const expectedValue = "helloy";

    const { container, getByTestId } = render(

        <I18nextProvider i18n={i18n}>
          <PadSweeper 
            initialState={testInitialState} 
            onConfigured={mockOnConfigured}
            testdata={testData} />
        </I18nextProvider>

    );

    const appendInput = getByTestId('append-input');

    // simulate a user input
    fireEvent.change(appendInput, { target: { value: 'y' } });

    const contentAfter = getByTestId('content-after');
    expect(contentAfter).toHaveTextContent(expectedValue);
    
    expect(mockOnConfigured.mock.calls[0][0]).toStrictEqual(
      {
        key: SweeperFunctionType.pad,
        params: {
          append: 'y',
          prepend: undefined
        }
      })
    expect(mockOnConfigured.mock.calls[0][1]).toStrictEqual(expectedValue)
    
  });

  test('when entering prefix + suffix', () => {

    // a dummy mock
    const mockOnConfigured = jest.fn();
    const expectedValue = "xhelloy";

    const { container, getByTestId } = render(

        <I18nextProvider i18n={i18n}>
          <PadSweeper 
            initialState={testInitialState} 
            onConfigured={mockOnConfigured}
            testdata={testData} />
        </I18nextProvider>

    );

    const prependInput = getByTestId('prepend-input');
    const appendInput = getByTestId('append-input');

    // simulate a user input
    fireEvent.change(prependInput, { target: { value: 'x' } });
    fireEvent.change(appendInput, { target: { value: 'y' } });

    const contentAfter = getByTestId('content-after');
    expect(contentAfter).toHaveTextContent(expectedValue);
    
    // 1st update --> x
    expect(mockOnConfigured.mock.calls[0][0]).toStrictEqual(
      {
        key: SweeperFunctionType.pad,
        params: {
          append: undefined,
          prepend: 'x'
        }
      })
    expect(mockOnConfigured.mock.calls[0][1]).toStrictEqual('xhello')

    // 2nd call --> x + y
    expect(mockOnConfigured.mock.calls[1][0]).toStrictEqual(
      {
        key: SweeperFunctionType.pad,
        params: {
          append: 'y',
          prepend: 'x'
        }
      })
    expect(mockOnConfigured.mock.calls[1][1]).toStrictEqual(expectedValue)
    
  });


});

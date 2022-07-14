import React, { useState, useContext, useEffect } from 'react';
import { Input, Space } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import {BackendContext} from '../../../BackendContext';
import { IBackendServicesProvider } from '../../../BackendProvider';
import { GenericResponseStatus } from '../../../interfaces';
import {
  DataSelector,
  SelectorStatus,
  DataSelectorValidityError,
  DataSelectorValidityResponse
} from '../../../interfaces/spider';

import './SelectorInput.scoped.css';

const { TextArea } = Input;

interface ISelectorInputPropsType {
  selector: DataSelector;
  onChange: (selector: DataSelector) => void;
}

/**
 * A Textarea input which makes auto-validation of CSS selector
 *
 * NB: initially, validateSelector is not called when setting the path
 * because there is no change on the textarea input value
 *
 * The selector (validated or not) is returned in the onChange prop function
 *
 * @param props : ISelectorInputPropsType
 * @returns JSX.Element
 */
export const SelectorInput = (props: ISelectorInputPropsType): JSX.Element => {
  const { t } = useTranslation('configurator');

  const { selector, onChange, ...rest } = props;

  // const socket = useContext<Socket>(ScrapingSocketContext);
  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  /**
   * the textare input path
   * which will populate the selector object
   */
  const [path, setPath] = useState<string>('');

  /**
   * sometimes shit happen on the backend side
   * we should be able to catch errors from the backend
   * and do something with it
   */
  const [isBackendError, setIsBackendError] = useState<boolean>(false);

  const [inputClass, setInputClass] = useState<string>('');

  /**
   * TODO: useCallback
   * @param s
   */
  const validateSelector = (s: DataSelector) => {
    setIsBackendError(false);

    backendProvider.scraping.validateSelector(
      {},
      s,
      (resp: DataSelectorValidityResponse | DataSelectorValidityError) => {
        if (resp.status === GenericResponseStatus.ERROR) {
          setIsBackendError(true);
          setInputClass('error');
          s.status = SelectorStatus.INVALID;
        } else {
          s.status = resp.selector.status;

          if (resp.selector.status === SelectorStatus.VALID) {
            setInputClass('success');
          } else {
            setInputClass('error');
          }

          onChange(s);
        }
      }
    );
  };

  /**
   * triggered when the CSS selector input changes value
   *
   * @param e : an input event
   */
  const onSelectorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPath(val);
    if (selector !== undefined) {
      selector.path = val;
      validateSelector(selector);
    }
  };

  /**
   * initializes the selector path if provided by the selector prop
   *
   * NB: initially, validateSelector is not called when setting the path
   * because there is no change on the textarea input value
   */
  useEffect(() => {
    if (selector.path) {
      setPath(selector.path);
    } else {
      setPath('');
    }
  }, [selector]);

  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <TextArea
          rows={4}
          placeholder={t('field.selector.input_placeholder')}
          onBlur={onSelectorChange}
          onChange={onSelectorChange}
          value={path}
          className={inputClass}
          {...rest}
        />

        {isBackendError && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space direction="horizontal">
              <CloseCircleOutlined className="error"></CloseCircleOutlined>
              <span data-testid="backend_error">{t('field.evaluation.backend_error')}</span>
            </Space>
          </Space>
        )}
      </Space>
    </>
  );
};

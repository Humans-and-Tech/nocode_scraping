import React, { useState, useContext, useEffect, useRef } from 'react';
import { Space, Spin, Switch, Button, Tooltip } from 'antd';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import isURL from 'validator/lib/isURL';

import {BackendContext} from '../../../BackendContext';
import { IBackendServicesProvider } from '../../../BackendProvider';
import { Data, DataSelector, SelectorStatus, Spider } from '../../../interfaces/spider';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';
import { SelectorInput } from './SelectorInput';
import { PreviewContent } from './PreviewContent';
import { SampleUrlSelector } from '../../Spider/SpiderSampleURL';
import { displayMessage, NotificationLevel } from '../../Layout/UserNotification';

import '../Data.scoped.css';

const createSelector = (): DataSelector => {
  return {
    path: undefined
  };
};

interface ISelectorConfigPropsType {
  data: Data;
  spider: Spider;
  onConfigured: (data: Data) => void;

  // the onError is just there
  // in case of functional error
  // to let the parent know of an error
  onError?: () => void;
  onChange: (d: Data) => void;
}

/**
 * this component provides features to validate a CSS path
 * and to evaluate a CSS selector. When the evaluation is successful,
 * onConfigured callback is called
 *
 * The validation can be bypassed, in such a case the CSS path
 * is considered as valid and the onConfigured callback is called
 *
 * When the evaluation fails, and the user does not bypass the evaluation
 * the onError is called
 *
 * @param props IDataSelectorPropsType
 * @returns JSX.Element
 */
export const SelectorConfig = (props: ISelectorConfigPropsType): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  const { data, spider, onConfigured, onError, onChange } = props;

  const [localData, setLocalData] = useState<Data | undefined>(undefined);

  // keep track of the current data loaded in this component
  // so that the component states are re-init when the data change
  const dataName = useRef<string>('');

  // we need to manage both the select and its status
  // to pass the status in the dependency array of useEffect
  // where evaluation stuff will be recomputed
  // indeed, passing the [selector] in the dependency array of useEffect won't work
  const [selector, setSelector] = useState<DataSelector | undefined>(undefined);
  const [selectorStatus, setSelectorStatus] = useState<SelectorStatus | undefined>(undefined);

  const [sampleUrl, setSampleUrl] = useState<URL | undefined>(undefined);

  /**
   * optionnally, the user may want to configure
   * a CSS selector to click on a cookie pop-up and eliminate it
   *
   * the cookie pop-up is just used to evaluate the selector
   */
  const [isPopup, setIsPopup] = useState<boolean | undefined>(false);
  const [popupSelector, setPopupSelector] = useState<DataSelector | undefined>(undefined);
  const [popupSelectorStatus, setPopupSelectorStatus] = useState<SelectorStatus | undefined>(undefined);

  /**
   * the result of the CSS Selector evaluation on the URL (evalUrl)
   * scraped by the backend
   */
  const [evaluation, setEvaluation] = useState<ScrapingResponse | ScrapingError | undefined>(undefined);
  const [evaluationHelperMessage, setEvaluationHelperMessage] = useState<string>('');
  const [isEvaluationEnabled, setIsEvaluationEnabled] = useState<boolean>(false);

  /**
   * sometimes shit happen on the backend side
   * we should be able to catch errors from the backend
   * and do something with it
   */
  const [isBackendError, setIsBackendError] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * triggered when the user changes the selector input value
   * @param s
   */
  const onDataSelectorChange = (s: DataSelector) => {
    setSelector(s);
    setSelectorStatus(s.status);
  };

  const onPopupSelectorChange = (s: DataSelector) => {
    setPopupSelector(s);
    setPopupSelectorStatus(s.status);
  };

  const changeSampleUrl = (url: URL) => {
    setSampleUrl(url);
    setEvaluation(undefined);
  };

  /**
   * evaluates the CSS selector path, which means gets the content
   * of this selector
   *
   * Under the hood: calls the backend :
   * - if the response is successfull, onConfigured() is called
   * - if not onError() is called
   *
   * @param event
   */
  const evaluateSelectorPath = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    // reset evaluation
    setEvaluation(undefined);

    setIsLoading(true);

    // reset backend error
    setIsBackendError(false);

    if (localData && selector?.path !== undefined && sampleUrl) {
      // for testing purpose
      // re-assign the path which might not be up-to-date
      // when calling the evaluateSelectorPath after calling the onChange
      // because onChange calls setPath --> path might not be up-to-date
      // data.selector.path = path

      // don't pass the cookiePopupPath if the switch button is not activated
      const _cookiePpSelector = isPopup ? popupSelector : undefined;

      backendProvider.scraping.getContent(
        {},
        selector,
        sampleUrl,
        _cookiePpSelector,
        (response: ScrapingResponse | ScrapingError) => {
          // whether the evaluation is successful or not
          // send it to the PreviewContent component
          // to display adequate information
          setEvaluation(response);

          // check the response status
          if (response.status == ScrapingStatus.SUCCESS) {
            // assign the response selector
            // which is enriched with a status valid/invalid
            localData.selector = response.selector;
            localData.isPopup = isPopup;

            if (response.clickBefore) {
              localData.popupSelector = response.clickBefore[0];
            } else {
              localData.popupSelector = undefined;
            }

            setLocalData(localData);
            onConfigured(localData);
          } else {
            if (response.status === ScrapingStatus.ERROR) {
              // there has been a technical error
              // on the backend side
              // notify the user by a special message
              displayMessage(
                NotificationLevel.ERROR,
                t('field.evaluation.failure_unknown', { message: response.message })
              );
              setIsBackendError(true);
            }

            // this is a functional error
            if (onError) {
              onError();
            }
          }

          setIsLoading(false);
        }
      );
    }
  };

  const switchCookiePopupSelector = (): void => {
    setIsPopup(!isPopup);
  };

  /**
   * triggered only when the data name or sampleUrl change !
   *
   * Loads the selector with the data selector if existing
   * otherwise creates a blank selector object
   *
   * Initializes as well a popup selector
   *
   */
  useEffect(() => {
    const _isEvaluationEnabled = (
      _selector: DataSelector | undefined,
      _popupSelector: DataSelector | undefined,
      _isPopup: boolean | undefined
    ): boolean => {
      if (!_selector) {
        return false;
      }
      let condition =
        sampleUrl !== undefined && isURL(sampleUrl.toString()) && _selector?.status === SelectorStatus.VALID;
      if (_isPopup && _popupSelector) {
        condition = condition && _popupSelector.status === SelectorStatus.VALID;
      }
      return condition;
    };

    const _evaluationHelperMessage = (
      _selector: DataSelector | undefined,
      _popupSelector: DataSelector | undefined,
      _isPopup: boolean | undefined
    ): string => {
      if (sampleUrl === undefined || !isURL(sampleUrl.toString())) {
        return t('field.evaluation.disabled_incorrect_sample_url');
      }
      if (_selector?.status === SelectorStatus.INVALID) {
        return t(`field.evaluation.disabled`, { value: _selector?.path });
      }
      if (_isPopup && _popupSelector && _popupSelector.status === SelectorStatus.INVALID) {
        return t(`field.evaluation.disabled`, { value: _popupSelector?.path });
      }
      return t('field.evaluation.enabled');
    };

    // reset only the component state when data name changes
    // because data is a complet ovject, its inner value change
    if (localData === undefined || data.name !== dataName.current) {
      dataName.current = data.name;

      // create local copy
      // so that data can evolve without impacting / being impacted
      // by the rest of the application
      setLocalData(data);

      if (spider.sampleURLs) {
        setSampleUrl(spider.sampleURLs[0]);
      }

      // these objects have their own lifecycle
      setIsPopup(data.isPopup);

      if (data.selector) {
        setSelector(data.selector);
      } else {
        setSelector(createSelector());
      }

      if (data.popupSelector) {
        setPopupSelector(data.popupSelector);
      } else {
        setPopupSelector(createSelector());
      }

      // reset the preview component
      // when data change
      setEvaluation(undefined);

      // initially, compute if evaluation is enabled
      // by passing directly the info coming from the data
      setIsEvaluationEnabled(_isEvaluationEnabled(data.selector, data.popupSelector, data.isPopup));
      setEvaluationHelperMessage(_evaluationHelperMessage(data.selector, data.popupSelector, data.isPopup));
    } else {
      // recompute the evaluation stuff
      setIsEvaluationEnabled(_isEvaluationEnabled(selector, popupSelector, isPopup));
      setEvaluationHelperMessage(_evaluationHelperMessage(selector, popupSelector, isPopup));

      // saveData
      // pass the changed object to the parent
      localData.selector = selector;
      localData.isPopup = isPopup;
      localData.popupSelector = popupSelector;
      onChange(localData);
    }
  }, [sampleUrl, data, selectorStatus, popupSelectorStatus, isPopup]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {!sampleUrl && (
        <Space direction="horizontal" size="middle">
          <CloseCircleOutlined className="error"></CloseCircleOutlined>
          <span data-testid="no_url">{t('field.evaluation.no_url')}</span>
        </Space>
      )}
      {selector && (
        <>
          <span>{t('field.selector.intro')}</span>
          <SelectorInput data-testid="selector-input" selector={selector} onChange={onDataSelectorChange} />
        </>
      )}
      {
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {
            <Space direction="horizontal" size="middle">
              <Switch onChange={switchCookiePopupSelector} checked={isPopup} />
              <h4>
                <a id="switch-popup-selector">{t('field.evaluation.set_cookie_popup_path')}</a>
              </h4>
            </Space>
          }
          {isPopup && popupSelector && (
            <>
              <span data-testid="popup-selector-intro">{t('field.popup_selector.intro')}</span>
              <SelectorInput
                data-testid="popup-selector-input"
                selector={popupSelector}
                onChange={onPopupSelectorChange}
              />
            </>
          )}
        </Space>
      }

      {isLoading && (
        <Space data-testid="sample-url" direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <Spin />
            <span>{t('loading')}</span>
          </Space>
          {selector !== null && sampleUrl && (
            <Space direction="vertical" size="small">
              <span style={{ display: 'inline-block' }}>{t('field.evaluation.evaluating_on')}</span>
              <span style={{ display: 'inline-block' }}>
                <a
                  href={sampleUrl.toString()}
                  title={t('field.evaluation.link_title')}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sampleUrl.toString()}
                </a>
              </span>
            </Space>
          )}
        </Space>
      )}

      {!isLoading && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {t('field.action.select_sample_url')}
          <SampleUrlSelector spider={spider} onSelect={changeSampleUrl} initialSelectedUrl={sampleUrl} />

          <Space direction="horizontal" size="middle">
            <Tooltip title={evaluationHelperMessage}>
              <Button
                onClick={evaluateSelectorPath}
                type="primary"
                disabled={!isEvaluationEnabled}
                data-testid="evaluation-button"
              >
                <span data-testid="evaluate_selector">{t('field.action.evaluate_selector')}</span>
              </Button>
            </Tooltip>
          </Space>
        </Space>
      )}

      {evaluation && <PreviewContent content={evaluation} />}

      {evaluation && !isPopup && (
        <Space direction="horizontal">
          <QuestionCircleOutlined />
          <span>{t('field.evaluation.screenshot_helper')}</span>
          <a
            onClick={switchCookiePopupSelector}
            href="#switch-cookie-selector"
            title={t('field.evaluation.screenshot_helper_link_to_cookie_selector')}
          >
            {t('field.evaluation.screenshot_helper_link_to_cookie_selector')}
          </a>
        </Space>
      )}

      {isBackendError && (
        <Space data-testid="backend-error-message" direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            <span>{t('field.evaluation.backend_error')}</span>
          </Space>
        </Space>
      )}
    </Space>
  );
};

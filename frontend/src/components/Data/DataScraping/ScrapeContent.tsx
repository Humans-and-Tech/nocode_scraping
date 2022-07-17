import React, { useState, useContext, useEffect, useRef } from 'react';
import { Space, Spin, Button, Tooltip } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import isURL from 'validator/lib/isURL';

import { ScrapingContext } from '../../../BackendContext';
import { IScrapingBackend } from '../../../BackendProvider';
import { Data, DataSelector, SelectorStatus, Spider } from '../../../interfaces/spider';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';
import { PreviewContent } from './PreviewContent';
import { SampleUrlSelector } from '../../Spider/SpiderSampleURL';
import { displayMessage, NotificationLevel } from '../../Layout/UserNotification';

import '../Data.scoped.css';

interface IScrapingPropsType {
  data: Data;
  spider: Spider;
  showScreenshot: boolean;
  onScraped?: (evaluation: ScrapingError | ScrapingResponse | undefined) => void;
}

export const ScrapeContent = (props: IScrapingPropsType): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<IScrapingBackend>(ScrapingContext);

  const { data, spider, onScraped, showScreenshot } = props;

  const [localData, setLocalData] = useState<Data | undefined>(undefined);

  // keep track of the current data loaded in this component
  // so that the component states are re-init when the data change
  const dataName = useRef<string>('');

  const [sampleUrl, setSampleUrl] = useState<URL | undefined>(undefined);

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
  const scrapeContent = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    // reset evaluation
    setEvaluation(undefined);

    setIsLoading(true);

    // reset backend error
    setIsBackendError(false);

    if (localData && data.selector?.path !== undefined && sampleUrl) {
      // don't pass the cookiePopupPath if the switch button is not activated
      const _cookiePpSelector = data.isPopup ? data.popupSelector : undefined;

      backendProvider.getContent(
        {},
        data.selector,
        sampleUrl,
        _cookiePpSelector,
        (response: ScrapingResponse | ScrapingError) => {
          // whether the evaluation is successful or not
          // send it to the PreviewContent component
          // to display adequate information
          setEvaluation(response);

          if (onScraped) {
            onScraped(response);
          }

          // check the response status
          if (response.status == ScrapingStatus.SUCCESS) {
            // assign the response selector
            // which is enriched with a status valid/invalid
            localData.selector = response.selector;

            if (response.clickBefore) {
              localData.popupSelector = response.clickBefore[0];
            } else {
              localData.popupSelector = undefined;
            }

            setLocalData(localData);

            // } else if () {
          } else if (response.status === ScrapingStatus.ERROR) {
            // there has been a technical error
            // on the backend side
            // notify the user by a special message
            displayMessage(
              NotificationLevel.ERROR,
              t('field.evaluation.failure_unknown', { message: response.message })
            );
            setIsBackendError(true);
          }

          setIsLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    const _isEvaluationEnabled = (spider: Spider, data: Data): boolean => {
      if (!data.selector) {
        return false;
      }
      let condition = false;
      if (spider.sampleURLs && data.selector?.status === SelectorStatus.VALID) {
        condition = true;
      }
      if (data.isPopup && data.popupSelector) {
        condition = condition && data.popupSelector.status === SelectorStatus.VALID;
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

      // reset the preview component
      // when data change
      setEvaluation(undefined);

      if (spider.sampleURLs) {
        setSampleUrl(spider.sampleURLs[0]);
      }
    }

    // initially, compute if evaluation is enabled
    // by passing directly the info coming from the data
    const _enabled = _isEvaluationEnabled(spider, data);

    if (!_enabled) {
      setEvaluation(undefined);
    }

    setIsEvaluationEnabled(_enabled);
    setEvaluationHelperMessage(_evaluationHelperMessage(data.selector, data.popupSelector, data.isPopup));
  }, [data.selector?.status, data.isPopup, data.popupSelector?.status, spider.sampleURLs]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {isLoading && (
        <Space data-testid="sample-url" direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <Spin />
            <span>{t('loading')}</span>
          </Space>
          {data.selector && sampleUrl && (
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
                onClick={scrapeContent}
                type="dashed"
                disabled={!isEvaluationEnabled}
                data-testid="evaluation-button"
              >
                <span>{t('field.action.evaluate_selector')}</span>
              </Button>
            </Tooltip>
          </Space>
        </Space>
      )}

      {evaluation && <PreviewContent showScreenshot={showScreenshot} content={evaluation} />}

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

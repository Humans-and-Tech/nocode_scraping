import React, { useState, useEffect, useRef } from 'react';
import { Space, Switch } from 'antd';
import {  QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { Data, DataSelector, SelectorStatus, Spider } from '../../../interfaces/spider';
import { ScrapingError, ScrapingResponse } from '../../../interfaces/scraping';
import { SelectorInput } from './SelectorInput';
import {ScrapeContent } from '../DataScraping/ScrapeContent';

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
  onConfigurationError?: (data: Data) => void;
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

  const { data, spider, onConfigured, onConfigurationError } = props;

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

  const onScraped = (evaluation: ScrapingResponse | ScrapingError | undefined) => {
    setEvaluation(evaluation);
  }


  const switchCookiePopupSelector = (): void => {
    const _isPopup = !isPopup
    setIsPopup(_isPopup);
  };


  useEffect(() => {

    // reset only the component state when data name changes
    // because data is a complet ovject, its inner value change
    if (localData === undefined || data.name !== dataName.current) {
      dataName.current = data.name;

      // create local copy
      // so that data can evolve without impacting / being impacted
      // by the rest of the application
      setLocalData(data);

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
    } else {

      const _data = localData;
      _data.selector = selector;
      _data.isPopup = isPopup;
      _data.popupSelector = popupSelector;
      setLocalData(_data);

      // callback the parent to let him know
      if (_data.selector?.status==SelectorStatus.VALID) {
        if (_data.isPopup && _data.popupSelector?.status==SelectorStatus.VALID) {
          onConfigured(_data);
        } else if (_data.isPopup && _data.popupSelector?.status==SelectorStatus.INVALID) {
          if (onConfigurationError) {
            onConfigurationError(_data);
          }
        } else {
          onConfigured(_data);
        }
      } else if (_data.selector?.status==SelectorStatus.INVALID) {
        if (onConfigurationError) {
          onConfigurationError(_data);
        }
      }
    }

  }, [data, selectorStatus, popupSelectorStatus, isPopup]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      
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

      {localData && <ScrapeContent spider={spider} data={localData} showScreenshot={true} onScraped={onScraped}/>}

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

    </Space>
  );
};

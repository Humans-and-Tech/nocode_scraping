import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { Divider, Space, Spin, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { ScrapingContext } from '../../../BackendContext';
import { IScrapingBackend } from '../../../BackendProvider';
import { Data, Spider } from '../../../interfaces/spider';
import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ReplaceCharSweeper } from './ReplaceCharSweeper';
import { SweepersResult } from './SweepersResult';
import { PadSweeper } from './PadSweeper';
import { ExtractData } from './RegexSweeper';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';
import { displayMessage, NotificationLevel } from '../../Layout/UserNotification';

import './Sweepers.scoped.css';

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({ data, spider }: { data: Data; spider: Spider }): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const backendProvider = useContext<IScrapingBackend>(ScrapingContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRetry, setIsRety] = useState<boolean>(false);

  /**
   * the content before being sweeped by a sweeper
   */
  const [contentBefore, setContentBefore] = useState<string | undefined>(undefined);

  /**
   * the content after being sweeped by a sweeper
   */
  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  const [contentBeforeRemove, setContentBeforeRemove] = useState<string | undefined>(undefined);
  const [contentAfterRemove, setContentAfterRemove] = useState<string | undefined>(undefined);
  const [contentBeforeReplace, setContentBeforeReplace] = useState<string | undefined>(undefined);
  const [contentAfterReplace, setContentAfterReplace] = useState<string | undefined>(undefined);
  const [contentBeforePad, setContentBeforePad] = useState<string | undefined>(undefined);
  const [contentAfterPad, setContentAfterPad] = useState<string | undefined>(undefined);
  const [contentBeforeRegex, setContentBeforeRegex] = useState<string | undefined>(undefined);
  const [contentAfterRegex, setContentAfterRegex] = useState<string | undefined>(undefined);

  /**
   * when the value passed is undefined, it means that the sweeper is deactivated
   * @param val
   */
  const updateContentAfterRemove = (val: string | undefined) => {
    if (val) {
      setContentAfterRemove(val);
      setContentBeforeReplace(val);
    } else {
      setContentAfterRemove(contentBefore);
      setContentBeforeReplace(contentBefore);
    }
  };

  const updateContentAfterReplace = (val: string | undefined) => {
    if (val) {
      setContentAfterReplace(val);
      setContentBeforePad(val);
    } else {
      setContentAfterReplace(contentBeforeReplace);
      setContentBeforePad(contentBeforeReplace);
    }
  };

  const updateContentAfterPad = (val: string | undefined) => {
    if (val) {
      setContentAfterPad(val);
      setContentBeforeRegex(val);
    } else {
      setContentAfterPad(contentBeforePad);
      setContentBeforeRegex(contentBeforePad);
    }
  };

  const updateContentAfterRegex = (val: string | undefined) => {
    if (val) {
      setContentAfterRegex(val);
    } else {
      setContentAfterRegex(contentBeforeRegex);
    }
  };

  const updateContentAfter = () => {
    if (contentAfterRegex) {
      setContentAfter(contentAfterRegex);
    } else if (contentAfterPad) {
      setContentAfter(contentAfterPad);
    } else if (contentAfterReplace) {
      setContentAfter(contentAfterReplace);
    } else if (contentAfterRemove) {
      setContentAfter(contentAfterRemove);
    } else {
      setContentAfter(undefined);
    }
  };

  const loadContentBefore = () => {
    if (data.selector && spider.sampleURLs) {
      setIsRety(false);
      setIsLoading(true);
      backendProvider.getContent(
        {},
        data.selector,
        spider.sampleURLs[0],
        data.popupSelector,
        (response: ScrapingResponse | ScrapingError) => {
          if (response.status == ScrapingStatus.SUCCESS && response.content) {
            setContentBefore(response.content);
            setContentBeforeRemove(response.content);
            setContentAfter(undefined);
          } else {
            displayMessage(NotificationLevel.ERROR, t('loading_error'));
            // retry in case of failure
            setIsRety(true);
          }

          setIsLoading(false);
        }
      );
    }
  };

  /**
   * scrape content based on a sample URL
   */
  useEffect(() => {
    if (!contentBefore) {
      loadContentBefore();
    }
    updateContentAfter();
  }, [contentBefore, contentAfterRemove, contentAfterReplace, contentAfterPad, contentAfterRegex]);

  return (
    <>
      {<Spin spinning={isLoading} size="large" style={{ width: '100%', marginTop: '3em', marginBottom: '3em' }} />}
      {isRetry && (
        <Button onClick={loadContentBefore} danger>
          {t('retry')}
        </Button>
      )}
      {contentBefore && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <RemoveCharSweeper onConfigured={updateContentAfterRemove} testdata={contentBeforeRemove} />
          <ReplaceCharSweeper onConfigured={updateContentAfterReplace} testdata={contentBeforeReplace} />
          <PadSweeper onConfigured={updateContentAfterPad} testdata={contentBeforePad} />
          <ExtractData onConfigured={updateContentAfterRegex} testdata={contentBeforeRegex} />
          
          {contentAfter && (
            <>
              <Divider orientation="left">{t('divider_cleaning_preview') as ReactNode}</Divider>
              <SweepersResult contentBefore={contentBefore} contentAfter={contentAfter} />
            </>
          )}

        </Space>
      )}
    </>
  );
};

import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { Divider, Space, Spin } from 'antd';
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
// import {ScrapeContent} from '../DataScraping/ScrapeContent';

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

  /**
   * the content before being sweeped by a sweeper
   */
  const [contentBefore, setContentBefore] = useState<string | undefined>(undefined);

  /**
   * the content after being sweeped by a sweeper
   */
  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  /**
   * the content transformed by the accumulation of all sweepers
   */
  // const [contentCumulatedAfter, setContentCumulatedAfter] = useState<string | undefined>(undefined);

  /**
   * when the value passed is undefined, it means that the sweeper is deactivated
   * @param val
   */
  const updateContentAfter = (val: string | undefined) => {
    if (val) {
      setContentAfter(val);
    } else {
      // reset the sweepers and replay them
      setContentBefore(undefined);
    }
  };

  const onDataExtract = (regex: string | undefined) => {
    console.log(regex);
  };

  /**
   * scrape content based on a sample URL
   */
  useEffect(() => {
    if (!contentBefore && data.selector && spider.sampleURLs) {
      setIsLoading(true);

      backendProvider.getContent(
        {},
        data.selector,
        spider.sampleURLs[0],
        data.popupSelector,
        (response: ScrapingResponse | ScrapingError) => {
          if (response.status == ScrapingStatus.SUCCESS && response.content) {
            setContentBefore(response.content);
            setContentAfter(undefined);
          } else {
            console.error('error', response);
            displayMessage(NotificationLevel.ERROR, t('loading_error'));
          }

          setIsLoading(false);
        }
      );
    } else {
      // accumulate the sweepers
      // --> each time contentAfter is updated,
      // the contentBefore becomes the contentAfter
      if (contentAfter) {
        setContentBefore(contentAfter);
      }
    }
  }, [contentBefore, contentAfter]);

  return (
    <>
      {<Spin spinning={isLoading} size="large" style={{ width: '100%', marginTop: '3em', marginBottom: '3em' }} />}
      {contentBefore && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <RemoveCharSweeper onConfigured={updateContentAfter} testdata={contentBefore} />
          <ReplaceCharSweeper onConfigured={updateContentAfter} testdata={contentBefore} />
          <PadSweeper onConfigured={updateContentAfter} testdata={contentBefore} />
          <ExtractData onConfigured={onDataExtract} testdata={contentBefore} />
          {/* <Divider orientation="left">{t('divider_try_on_real_data') as ReactNode}</Divider>
          <ScrapeContent spider={spider} data={data} showScreenshot={false}  /> */}
          {/* {contentCumulatedAfter && contentBefore && ( */}
          {/* <> */}
          {/* <Divider orientation="left">{t('divider_cleaning_preview') as ReactNode}</Divider> */}
          {/* <SweepersResult contentBefore={contentBefore} contentAfter={contentCumulatedAfter} /> */}
          {/* </> */}
          {/* )} */}
        </Space>
      )}
    </>
  );
};

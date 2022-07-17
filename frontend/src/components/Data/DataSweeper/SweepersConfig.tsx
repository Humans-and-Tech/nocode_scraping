import React, { ReactNode, useEffect, useState } from 'react';
import { Divider, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { ScrapeContent } from '../DataScraping/ScrapeContent';
import { Data, Spider } from '../../../interfaces/spider';
import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ReplaceCharSweeper } from './ReplaceCharSweeper';
import { SweepersResult } from './SweepersResult';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';

import './Sweepers.scoped.css';

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({ data, spider }: { data: Data; spider: Spider }): JSX.Element => {
  const { t } = useTranslation('sweepers');
  const [removeCharIndex, setRemoveCharIndex] = useState<number | undefined>(undefined);

  const [replaceCharBy, setReplaceCharBy] = useState<Array<string> | undefined>(undefined);

  const [contentBefore, setContentBefore] = useState<string | undefined>(undefined);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  /**
   * when val is undefined, it means that the `RemoveCharSweeper` is not active
   *
   * @param val
   */
  const removeChar = (val: number | undefined) => {
    setRemoveCharIndex(val);
  };

  const replaceChar = (replaced: string | undefined, replacedBy: string | undefined) => {
    if (replaced && replacedBy) {
      setReplaceCharBy([replaced, replacedBy]);
    } else {
      setReplaceCharBy(undefined);
    }
  };

  /**
   * the `raw` content scraped
   *
   * @param response ScrapingError|ScrapingResponse|undefined
   */
  const getContentBefore = (response: ScrapingError | ScrapingResponse | undefined) => {
    if (response && response.status === ScrapingStatus.SUCCESS) {
      if (response.content) {
        setContentBefore(response.content);
      }
    }
  };

  useEffect(() => {
    let finalString = contentBefore;
    if (contentBefore) {
      if (removeCharIndex) {
        finalString =
          contentBefore.substring(0, removeCharIndex - 1) +
          contentBefore.substring(removeCharIndex, contentBefore.length);
      }
      if (finalString && replaceCharBy) {
        finalString = finalString.replace(replaceCharBy[0], replaceCharBy[1]);
      }
    }
    setContentAfter(finalString);
  }, [removeCharIndex, contentBefore, replaceCharBy]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper onConfigured={removeChar} />
      <ReplaceCharSweeper onConfigured={replaceChar} />
      <Divider orientation="left">{t('divider_try_on_real_data') as ReactNode}</Divider>
      <ScrapeContent spider={spider} data={data} showScreenshot={false} onScraped={getContentBefore} />
      {contentBefore && contentAfter && (
        <>
          <Divider orientation="left">{t('divider_cleaning_preview') as ReactNode}</Divider>
          <SweepersResult contentBefore={contentBefore} contentAfter={contentAfter} />
        </>
      )}
    </Space>
  );
};

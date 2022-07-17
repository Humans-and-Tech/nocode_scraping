import React, { useEffect, useState } from 'react';
import { Divider, Space } from 'antd';

import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ScrapeContent } from '../DataScraping/ScrapeContent';
import { Data, Spider } from '../../../interfaces/spider';
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
  const [removeCharIndex, setRemoveCharIndex] = useState<number | undefined>(undefined);

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
    }
    setContentAfter(finalString);
  }, [removeCharIndex, contentBefore]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper onConfigured={removeChar} />
      <ScrapeContent spider={spider} data={data} showScreenshot={false} onScraped={getContentBefore} />
      {contentBefore && contentAfter && (
        <>
          <Divider></Divider>
          <SweepersResult contentBefore={contentBefore} contentAfter={contentAfter} />
        </>
      )}
    </Space>
  );
};

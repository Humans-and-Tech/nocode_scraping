import React, {useEffect, useState} from 'react';
import { Space } from 'antd';

import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ScrapeContent } from '../DataScraping/ScrapeContent';
import { Data, Spider } from '../../../interfaces/spider';
import './Sweepers.scoped.css';
import { ScrapingError,ScrapingResponse,ScrapingStatus } from '../../../interfaces/scraping';

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({data, spider}: {data: Data, spider: Spider}): JSX.Element => {

  const [removeCharIndex, setRemoveCharIndex] = useState<number|undefined>(undefined)

  const [content, setContent] = useState<string|undefined>(undefined);

  const [sweepedContent, setSweepedContent] = useState<string|undefined>(undefined);

  const removeChar = (val: number) => {
    setRemoveCharIndex(val);
    console.log('removeChar', val, content);
    if (content) {
      const finalString = content.substring(0, val - 1) + content.substring(val, content.length);
      console.log('finalString', finalString)
      setSweepedContent(finalString);
    }
  }

  const applySweepers = (response: ScrapingError|ScrapingResponse|undefined) => {
    if (response && response.status===ScrapingStatus.SUCCESS) {
      if (response.content){
        console.log("applySweepers", response.content)
        setContent(response.content);
    }
    }
  };

  useEffect(()=> {
    console.log('refresh me');
  }, [removeCharIndex, content])

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper onConfigured={removeChar} />
      <ScrapeContent spider={spider} data={data} showScreenshot={false} onScraped={applySweepers} />
      {sweepedContent && <span>{sweepedContent}</span>}
    </Space>
  );
};

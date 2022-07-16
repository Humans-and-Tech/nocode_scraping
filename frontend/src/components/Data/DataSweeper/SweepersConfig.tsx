import React from 'react';
import { Space } from 'antd';

import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ScrapeContent } from '../DataScraping/ScrapeContent';
import { Data, DataSelector, SelectorStatus, Spider } from '../../../interfaces/spider';
import './Sweepers.scoped.css';

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({data, spider}: {data: Data, spider: Spider}): JSX.Element => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper data={data} />
      <ScrapeContent spider={spider} data={data} showScreenshot={false} />
    </Space>
  );
};

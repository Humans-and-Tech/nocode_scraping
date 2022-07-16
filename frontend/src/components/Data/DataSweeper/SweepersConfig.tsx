import React from 'react';
import { Space } from 'antd';
import { Data } from '../../../interfaces/spider';
import { RemoveCharSweeper } from './RemoveCharSweeper';

import './Sweepers.scoped.css';
import { PreviewContent } from '../DataSelector/PreviewContent';

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({data}: {data: Data}): JSX.Element => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper data={data} />
      {/* <PreviewContent></PreviewContent> */}
    </Space>
  );
};

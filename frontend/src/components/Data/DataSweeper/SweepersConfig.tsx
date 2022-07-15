import React from 'react';
import { Space } from 'antd';
import { Data } from '../../../interfaces/spider';
import { RemoveCharSweeper } from './RemoveCharSweeper';

import './Sweepers.scoped.css';

/**
 * Alterators are meant to slightly transform
 * data scraped
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({data}: {data: Data}): JSX.Element => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <RemoveCharSweeper data={data} />
    </Space>
  );
};

import React from 'react';
import { Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface ISweepersResultPropsType {
  contentBefore: string;
  contentAfter: string;
}

/**
 * this component offers a preview of the sweeping result
 *
 * @param props ISweepersResultPropsType
 * @returns JSX.Element
 */
export const SweepersResult = (props: ISweepersResultPropsType): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const { contentBefore, contentAfter } = props;

  return (
    <>
      {contentAfter && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal" style={{ justifyContent: 'center', textAlign: 'center', width: '100%' }}>
            <span className="highlight">{contentBefore}</span>
            <RightOutlined></RightOutlined>
            <span className="highlight">{contentAfter}</span>
          </Space>
        </Space>
      )}
    </>
  );
};

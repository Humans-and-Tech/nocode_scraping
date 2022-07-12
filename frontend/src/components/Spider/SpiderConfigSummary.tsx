import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Space, Spin } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { IBackendServicesProvider, BackendContext } from '../../BackendSocketContext';
import { Spider } from '../../interfaces/spider';

import './SpiderConfig.scoped.css';

/**
 * Provides access to the Spider Config from a Page layout
 *
 */
export const SpiderConfigSummary = (): JSX.Element => {
  
  const { t } = useTranslation('configurator');

  const spider = useRef<Spider | undefined>(undefined);
  
  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  // the spider name is fetched from the URL path !
  // it is NOT the data name !
  const { name } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const configureSampleUrls = () => {
    console.log("nothin")
  };


  useEffect(() => {
    if (spider.current?.name !== name && name !== undefined) {
      
      setIsLoading(true);
      backendProvider.spider.get(name, (_spider: Spider | undefined) => {
        if (_spider) {
          spider.current = _spider;
        } else {
          // TODO
          // notify the user,
          // the spider wasn't found
          // propose to navigate to another screen ?
          // or redirect the user ?
        }
        setIsLoading(false);
      });
    }
  }, [backendProvider, name]);


  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {isLoading && (
        
          <Space direction="horizontal">
            <Spin />
            <span>{t('loading')}</span>
          </Space>

      )}
      {!isLoading && (

        <>
        <h4 dangerouslySetInnerHTML={{ __html: t('spider.title', { spider: spider.current?.name }) }}></h4>

        {
          !spider.current?.sampleURLs &&
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            <span>{t('spider.cannot_start_scraping')}</span>
            <a
              onClick={configureSampleUrls}
              title={t('spider.define_sample_urls')}
            >
              {t('spider.define_sample_urls')}
            </a>
          </Space>
        }
        </>

      )}
    </Space>
  )
  
};

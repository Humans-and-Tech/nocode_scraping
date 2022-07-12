import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Space, Spin } from 'antd';

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
    <>
      {isLoading && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <Spin />
            <span>{t('loading')}</span>
          </Space>
        </Space>
      )}
      {!isLoading && (

        <h4 dangerouslySetInnerHTML={{ __html: t('spider.title', { spider: spider.current?.name }) }}></h4>

      )}
    </>
  )
  
};

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Space, Spin, Tabs, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import { BackendContext } from '../../BackendContext';
import { IBackendServicesProvider } from '../../BackendProvider';
import { Spider } from '../../interfaces/spider';
import { displayMessage, NotificationLevel } from '../Layout/UserNotification';

import { SampleURLManager } from './SpiderSampleURL';
import { ConfigSidebar } from '../Layout/ConfigSidebar';

import './SpiderConfig.scoped.css';

const { TabPane } = Tabs;

/**
 * Provides access to the Spider Config from a Page layout
 *
 */
export const SpiderConfigSummary = (): JSX.Element => {
  const { t } = useTranslation('configurator');

  const spider = useRef<Spider | undefined>(undefined);

  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  // the spider name is fetched from the URL path !
  // it is NOT the data name !
  const { name } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const configureSampleUrls = () => {
    setIsSideBarOpen(true);
  };

  const closeSideBar = (): void => {
    setIsSideBarOpen(false);
  };

  const triggerSave = () => {
    if (spider.current) {
      backendProvider.spider.upsert(spider.current, (b: boolean, err: Error | undefined) => {
        if (b) {
          displayMessage(NotificationLevel.SUCCESS, t('spider.actions.update_success'));
          closeSideBar();
        } else {
          displayMessage(NotificationLevel.ERROR, t('spider.actions.update_error'));
          closeSideBar();
        }
      });
    }
  };
  const onTabChange = (key: string) => {
    console.log(key);
  };

  const saveBtn = <Button onClick={triggerSave}>{t('spider.actions.save_configuration')}</Button>;

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
      {isSideBarOpen && spider.current && (
        <ConfigSidebar
          isVisible={isSideBarOpen}
          onClose={closeSideBar}
          title={t('spider.configuration_title', { spider: spider.current?.name })}
        >
          <Tabs defaultActiveKey="1" onChange={onTabChange} tabBarExtraContent={saveBtn}>
            <TabPane tab={t('spider.config_sidebar.tab_sample_urls')} key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <p>{t('spider.sample_urls_intro')}</p>
                <SampleURLManager spider={spider.current} />
              </Space>
            </TabPane>
          </Tabs>
        </ConfigSidebar>
      )}

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

            {!spider.current?.sampleURLs && (
              <Space direction="horizontal">
                <CloseCircleOutlined className="error"></CloseCircleOutlined>
                <span>{t('spider.cannot_start_scraping')}</span>
                <a onClick={configureSampleUrls} title={t('spider.define_sample_urls')}>
                  {t('spider.define_sample_urls')}
                </a>
              </Space>
            )}
            {spider.current?.sampleURLs && (
              <a onClick={configureSampleUrls} title={t('spider.define_sample_urls')}>
                {t('spider.access_configuration')}
              </a>
            )}
          </>
        )}
      </Space>
    </>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Tabs, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import { Spider } from '../../interfaces/spider';

import { SampleURLManager } from './SpiderSampleURL';
import { ConfigSidebar } from '../Layout/ConfigSidebar';

import './SpiderConfig.scoped.css';

const { TabPane } = Tabs;

interface SpiderState {
  current: Spider;
}

/**
 * Provides access to the Spider Config from a Page layout
 *
 */
export const SpiderConfigSummary = (): JSX.Element => {
  const { t } = useTranslation('configurator');

  const spider = useSelector((state: SpiderState) => state.current);

  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  const configureSampleUrls = () => {
    setIsSideBarOpen(true);
  };

  const closeSideBar = (): void => {
    setIsSideBarOpen(false);
  };

  const triggerSave = () => {
    setIsSideBarOpen(false);
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const saveBtn = (
    <Button type="primary" onClick={triggerSave}>
      {t('spider.actions.save_configuration')}
    </Button>
  );

  return (
    <>
      {isSideBarOpen && spider && (
        <ConfigSidebar
          isVisible={isSideBarOpen}
          onClose={closeSideBar}
          title={t('spider.configuration_title', { spider: spider.name })}
        >
          <Tabs defaultActiveKey="1" onChange={onTabChange} tabBarExtraContent={saveBtn}>
            <TabPane tab={t('spider.config_sidebar.tab_sample_urls')} key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <p>{t('spider.sample_urls_intro')}</p>
                <SampleURLManager spider={spider} />
              </Space>
            </TabPane>
          </Tabs>
        </ConfigSidebar>
      )}

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {spider && (
          <>
            <h4 dangerouslySetInnerHTML={{ __html: t('spider.title', { spider: spider.name }) }}></h4>

            {!spider.sampleURLs && (
              <Space direction="horizontal">
                <CloseCircleOutlined className="error"></CloseCircleOutlined>
                <span>{t('spider.cannot_start_scraping')}</span>
                <a onClick={configureSampleUrls} title={t('spider.define_sample_urls')}>
                  {t('spider.define_sample_urls')}
                </a>
              </Space>
            )}
            {spider.sampleURLs && (
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

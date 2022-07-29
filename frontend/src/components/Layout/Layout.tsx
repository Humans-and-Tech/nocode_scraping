import React, { useEffect, useContext, useState } from 'react';
import { Layout, Space, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { setSpider } from '../../spiderSlice';
import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';
import { Spider } from '../../interfaces/spider';

import './Layout.scoped.css';

const { Header, Content } = Layout;

export const OnBoardingLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation('layout');

  return (
    <Layout>
      <Header className="gus-layout-helper">
        <h2>{t('helper.onboarding.title')}</h2>
        <p>{t('helper.onboarding.content')}</p>
      </Header>
      <Layout>
        <Content className="gus-onboarding-layout-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

/**
 * stores the spider for usage in all other components
 *
 * @param param0
 * @returns
 */
export const ScrapingLayout = ({ header, children }: { header: React.ReactNode; children: React.ReactNode }) => {
  const { t } = useTranslation('layout');

  // the spider name is fetched from the URL path
  // it is NOT the data name
  const { name } = useParams();

  const dispatch = useDispatch();
  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (name) {
      backendProvider.get(name, (_spider: Spider | undefined) => {
        if (_spider) {
          dispatch(setSpider(_spider));
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
  }, [name]);

  return (
    <Layout>
      <Header className="gus-layout-helper">
        <h2>{t('helper.title')}</h2>
        <p>{t('helper.content')}</p>
      </Header>

      {isLoading && (
        <Space direction="horizontal" size="middle">
          <Spin />
          <span>{t('loading')}</span>
        </Space>
      )}

      {!isLoading && (
        <Layout className="gus-scraping-layout">
          <Content className=".gus-scraping-layout-content">
            <Header className="gus-scraping-layout-header">{header}</Header>
            {children}
          </Content>
        </Layout>
      )}
    </Layout>
  );
};

import React from 'react';
import { Layout } from 'antd';
import { useTranslation } from 'react-i18next';

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

export const ScrapingLayout = ({ header, children }: { header: React.ReactNode; children: React.ReactNode }) => {
  const { t } = useTranslation('layout');

  return (
    <Layout>
      <Header className="gus-layout-helper">
        <h2>{t('helper.title')}</h2>
        <p>{t('helper.content')}</p>
      </Header>
      <Layout className='gus-scraping-layout'>
        <Content className=".gus-scraping-layout-content">
          <Header className="gus-scraping-layout-header">{header}</Header>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

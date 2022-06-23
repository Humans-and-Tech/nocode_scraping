import React, { useState, useContext } from "react";
import { Drawer, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { Data, Spider } from "../../interfaces/spider";
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext'

import { CSSSelector } from "./CSSelector";
import { DataAlterators } from '../Alterators/DataAlterators'

import './Scraping.scoped.css';


/**
 * Builds a UI to configure a Selector for the given scraping element
 * 
 * @param element: a ScrapingElement 
 * @returns 
 */
export const ScrapedFieldDrawer = ({
  data, spider
}: {
  data: Data,
  spider: Spider
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

  const socket = useContext<Socket>(SocketContext);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [isConfigured, setIsConfigured] = useState<boolean>(false);


  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const onConfigured = (data: Data): void => {
    setIsConfigured(true);
    spider.data?.add(data);
    spiderProvider.upsert(socket, spider, (b: boolean) => {
      console.log('upsert successful');
    });
  };

  const onError = (): void => {
    setIsConfigured(false);
  };

  /**
   * the page URL is passed to the selector
   * so that it can be evaluated
   */
  useEffect(() => {
    toggleDrawer();
  }, [data]);

  return (
    <Drawer
      title={t("field.title")}
      size="large"
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={isDrawerOpen}
    >
      <h2>{data.label}</h2>
      <Space direction="vertical" size="large" style={{ 'width': '100%' }}>

        {spider.sampleURLs && spider.sampleURLs.length > 0 &&
          <CSSSelector data={data} sampleUrl={spider.sampleURLs[0]} onConfigured={onConfigured} onError={onError} />
        }

        {isConfigured &&
          <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
            <h2>{t('field.alterators_title')}</h2>
            <DataAlterators />
          </Space>
        }
      </Space>
    </Drawer>
  );
};



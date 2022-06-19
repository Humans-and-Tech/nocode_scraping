import React, { useState, useContext } from "react";
import { Drawer, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'

import './Scraping.scoped.css';
import { CSSSelector } from "./CSSelector";
import { DataAlterators } from '../Alterators/DataAlterators'


export const ScrapedFieldDrawer = ({
  element
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const [selector, setSelector] = useState<Selector | undefined>(undefined);

  const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const socket = useContext<Socket>(SocketContext);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const onConfigured = (s: Selector): void => {
    setSelector(s);
    setIsConfigured(true);
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
  }, [element]);

  return (
    <Drawer
      title={t("field.title")}
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={isDrawerOpen}
    >
      <h2>{element.label}</h2>
      <Space direction="vertical" size="large">
        <CSSSelector selector={selector} pageUrl={configProvider.getConfig()?.pageUrl} onConfigured={onConfigured} onError={onError} />


        {isConfigured &&
          <Space direction="vertical" size="middle">
            <h2>{t('field.adaptors_title')}</h2>
            <DataAlterators />
          </Space>
        }
      </Space>
    </Drawer>
  );
};



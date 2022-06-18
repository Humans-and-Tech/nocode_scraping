import React, { useState, useContext } from "react";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'

import './Scraping.scoped.css';
import { CSSSelector } from "./CSSelector";


const Configurator = ({
  element
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const [selector, setSelector] = useState<Selector | undefined>(undefined);

  const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const socket = useContext<Socket>(SocketContext);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const onSelectorPath = (s: Selector): void => {
    setSelector(s);
  };

  /**
   * the page URL is passed to the selector
   * so that it can be evaluated
   */
  useEffect(() => {
    // reset selector
    // or fetch it from the backend
    // setSelector(undefined);
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
      <CSSSelector selector={selector} pageUrl={configProvider.getConfig()?.pageUrl} onPathConfigured={onSelectorPath} />
    </Drawer>
  );
};

export default Configurator;

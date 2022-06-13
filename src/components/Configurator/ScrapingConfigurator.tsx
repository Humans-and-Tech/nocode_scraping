import React, { useState } from "react";
import { Drawer } from "antd";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { ScrapingElement } from "../../interfaces";

const ScrapingConfigurator = ({
  element,
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("scraping_configurator");

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  /**
   * reload the Drawer when the element
   * to be configured changes
   */
  useEffect(() => {
    toggleDrawer();
  }, [element]);

  return (
    <Drawer
      title={t("title")}
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={isDrawerOpen}
    >
      <h2>{element.label}</h2>
      <p>{element.key}</p>
    </Drawer>
  );
};

export default ScrapingConfigurator;

import React, { useState } from "react";
import { Drawer } from "antd";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const ScrapingConfigurator = ({
  element,
}: {
  element: string;
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
      {element}
    </Drawer>
  );
};

export default ScrapingConfigurator;

import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Layout, Menu } from "antd";
import { LayoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import "./i18n";
import { SocketContext, socket } from "./socket";
import Configurator from "./components/Configurator/WebsiteConfigurator";
import ProductSheet from "./views/ProductPage/ProductSheet";

const rootElement = document.getElementById("root");
// to prevent TS compilation error
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

const { Header, Sider, Content } = Layout;

const ScraperLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("layout");
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const toggleConfig = (): void => {
    setIsConfigOpen(!isConfigOpen);
  };

  return (
    <Layout>
      <Header>
        <Button onClick={toggleConfig}>
          {t("action.define_website_url")}
        </Button>
        <Configurator isOpen={isConfigOpen} />
      </Header>
      <Header className="gus-layout-helper">
        <h2>{t("helper.title")}</h2>
        <p>{t("helper.content")}</p>
      </Header>
      <Layout>
        <Sider theme="light">
          <Menu>
            <Menu.Item key="product-sheet" className="gus-item">
              <div className="menu-title">
                <LayoutOutlined />
                <span>{t("menu_layout_choice.product_sheet")}</span>
              </div>
              <div>
                <em>{t("menu_layout_choice.product_sheet_desc")}</em>
              </div>
            </Menu.Item>
            <Menu.Item key="category-page" className="gus-item">
              <div className="menu-title">
                <LayoutOutlined />
                <span>{t("menu_layout_choice.category_page")}</span>
              </div>
              <div>
                <em>{t("menu_layout_choice.category_page_desc")}</em>
              </div>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="gus-layout-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

/**
 * the default route is /applications
 * but if the user is not authed, he/she is redirected to /login
 */
root.render(
  <StrictMode>
    <SocketContext.Provider value={socket}>
      <ScraperLayout>
        <ProductSheet />
      </ScraperLayout>
    </SocketContext.Provider>
  </StrictMode>
);

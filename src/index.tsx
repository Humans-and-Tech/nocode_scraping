import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button, Divider, Layout, Menu } from "antd";
import { LayoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import "./i18n";
import ProductSheet from "./views/ProductPage/ProductSheet";

const rootElement = document.getElementById("root");
// to prevent TS compilation error
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

const { Header, Footer, Sider, Content } = Layout;

const PageScraperLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("layout");
  return (
    <Layout>
      <Header>
        <Button>{t("action_scrape_url")}</Button>
      </Header>
      <Header className="gus-layout-helper">
        <p>{t("helper_text")}</p>
      </Header>
      <Layout>
        <Sider theme="light">
          <Menu>
            <Menu.Item className="gus-item">
              <LayoutOutlined />
              <span>{t("menu_product_sheet")}</span>
              <div>
                <em>{t("menu_product_sheet_desc")}</em>
              </div>
            </Menu.Item>
            <Menu.Item className="gus-item">
              <LayoutOutlined />
              <span>{t("menu_category_page")}</span>
              <div>
                <em>{t("menu_category_page_desc")}</em>
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
    <PageScraperLayout>
      <ProductSheet />
    </PageScraperLayout>
  </StrictMode>
);

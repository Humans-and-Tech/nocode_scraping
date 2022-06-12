import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Divider, Layout, Menu } from "antd";
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
        Le header présentera les actions possibles sur cette page (url à
        scraper...)
      </Header>
      <Layout>
        <Sider theme="light">
          <Menu>
            <Menu.Item>
              <LayoutOutlined />
              <span className="menu-item-title">{t("menu_product_sheet")}</span>
              <Divider></Divider>
              <span className="menu-item-desc">
                {t("menu_product_sheet_desc")}
              </span>
            </Menu.Item>
            <Menu.Item>
              <LayoutOutlined />
              <span className="menu-item-title">{t("menu_category_page")}</span>
              <span className="menu-item-desc">
                {t("menu_category_page_desc")}
              </span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content>{children}</Content>
      </Layout>
      <Footer>Footer</Footer>
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

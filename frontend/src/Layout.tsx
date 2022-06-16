import React, { useState } from "react";
import { Button, Layout, Menu } from "antd";
import { LayoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import "./i18n";
import Configurator from "./components/Configurator/WebsiteConfigurator";

const { Header, Sider, Content } = Layout;


export const OnBoardingLayout = ({ children }: { children: React.ReactNode }) => {
    const { t } = useTranslation("layout");

    return (
        <Layout>
            <Header className="gus-layout-helper">
                <h2>{t("helper.onboarding.title")}</h2>
                <p>{t("helper.onboarding.content")}</p>
            </Header>
            <Layout>
                <Content className="gus-onboarding-layout-content">{children}</Content>
            </Layout>
        </Layout>
    );
};

export const ScraperLayout = ({ children }: { children: React.ReactNode }) => {
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
                <h2>{t("helper.scraper.title")}</h2>
                <p>{t("helper.scraper.content")}</p>
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
                <Content className="gus-scraper-layout-content">{children}</Content>
            </Layout>
        </Layout>
    );
};
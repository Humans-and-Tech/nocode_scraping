import React, { useState } from "react";
import { Button, Layout, Menu } from "antd";
import { LayoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import "./i18n";


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

export const ScraperLayout = ({ header, children }: { header: React.ReactNode, children: React.ReactNode }) => {
    const { t } = useTranslation("layout");

    return (
        <Layout>
            <Header className="gus-layout-helper">
                <h2>{t("helper.title")}</h2>
                <p>{t("helper.content")}</p>
            </Header>
            <Layout>
                <Sider theme="light">
                    <Menu>
                        <Menu.Item key="menu-change-config" className="gus-item">
                            <div className="menu-title">
                                <span>{t("menu.change_config")}</span>
                            </div>
                            <div>
                                <em>{t("menu.change_config_desc")}</em>
                            </div>
                        </Menu.Item>
                        <Menu.Item key="menu-change-layout" className="gus-item">
                            <div className="menu-title">
                                <span>{t("menu.change_layout")}</span>
                            </div>
                            <div>
                                <em>{t("menu.change_layout_desc")}</em>
                            </div>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content className="gus-scraper-layout-content">
                    <Header className="gus-scraper-layout-content-header">
                        <h2>{t("helper.example_url")}</h2>
                        <p>{t("helper.example_url_desc")}</p>
                        {header}
                    </Header>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};
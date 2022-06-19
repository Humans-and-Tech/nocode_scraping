import React, { useState, useContext } from "react";
import { Space, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext';
import { RemoveCharAlterator } from '../Alterators/RemoveCharAlterator';

import './Scraping.scoped.css';

export const DataAlterators = (): JSX.Element => {

    const { t } = useTranslation("configurator");


    return (
        <Space direction="vertical" size="middle">
            <h3>{t('alterators')}</h3>

            <RemoveCharAlterator />

        </Space>
    );
}



import React, { useState, useContext } from "react";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'

import './Scraping.scoped.css';

export const DataAlterators = (): JSX.Element => {

    const { t } = useTranslation("configurator");


    return (
        <h1>
            {t('alterators')}
        </h1>
    );
};



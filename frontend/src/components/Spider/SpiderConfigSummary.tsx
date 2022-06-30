import React, { useState } from "react";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { Spider } from '../../interfaces/spider'
import './SpiderConfig.scoped.css';


/**
 * Provides access to the Spider Config from a Page layout
 * 
 */
export const SpiderConfigSummary = (): JSX.Element => {

    const { t } = useTranslation("configurator");

    const location = useLocation();

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // const [currentLocation, setCurrentLocation] = useState<string | undefined>(undefined);

    const toggleDrawer = (): void => {
        setIsDrawerOpen(!isDrawerOpen);
    };


    return (
        <span>{t('config_summary')}</span>
    );
};



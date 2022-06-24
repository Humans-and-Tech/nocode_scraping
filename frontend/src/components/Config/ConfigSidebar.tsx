import React, { useState } from "react";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';

import { Spider } from '../../interfaces/spider'
import './Config.scoped.css';


/**
 * Provides access to the Spider Config from a Page layout
 * 
 */
export const ConfigSidebar = ({ children, onSpiderConfigured }: { children: JSX.Element, onSpiderConfigured?: (p: Spider) => void }): JSX.Element => {

    const { t } = useTranslation("configurator");

    const location = useLocation();

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // const [currentLocation, setCurrentLocation] = useState<string | undefined>(undefined);

    const toggleDrawer = (): void => {
        setIsDrawerOpen(!isDrawerOpen);
    };


    /**
     * the page URL is passed to the selector
     * so that it can be evaluated
     */
    useEffect(() => {
        console.log('location', location);
        toggleDrawer();

    }, [location]);

    return (
        <Drawer
            title={t("field.title")}
            size="large"
            placement="right"
            closable={false}
            onClose={toggleDrawer}
            visible={isDrawerOpen}
        >
            {children}

        </Drawer>
    );
};



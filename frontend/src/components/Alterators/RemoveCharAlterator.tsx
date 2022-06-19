import React, { useState, useContext } from "react";
import { Space, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'



export const RemoveCharAlterator = (): JSX.Element => {

    const { t } = useTranslation("configurator");

    const [isChecked, setIsChecked] = useState<boolean>(false);

    const onChange = (checked: boolean) => {
        setIsChecked(!isChecked);
    };


    return (
        <Space direction="vertical" size="middle">
            <h3>{t('alterators')}</h3>

            <Switch onChange={onChange} checked={isChecked} />

        </Space>
    );
}



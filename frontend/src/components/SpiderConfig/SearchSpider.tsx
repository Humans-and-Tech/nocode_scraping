import React, { useContext, useEffect, useState } from "react";
import {
    Space,
    Input,
    Spin,
    Button
} from "antd";

import { Socket } from "socket.io-client";

import { ScrapingConfig } from '../../interfaces'
import { useTranslation } from "react-i18next";

import { ScrapingContext, ScrapingConfigProvider, createConfig } from '../../ConfigurationContext';
import { SocketContext } from "../../socket";
import { getConfig } from '../../socket/events'

import "./Config.scoped.css"


interface SeachSpiderProps {
    onLoaded: () => void;
}


export const SearchSpider = (props: SeachSpiderProps): JSX.Element => {

    const { t } = useTranslation("onboarding");

    const { onLoaded } = props;

    const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

    const [isProposalAccepted, setIsProposalAccepted] = useState<boolean | undefined>(undefined);

    const [configProposal, setConfigProposal] = useState<ScrapingConfig | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [name, setName] = useState<string | undefined>('');

    const [nameStatus, setNameStatus] = useState<'' | 'error'>('');

    const socket = useContext<Socket>(SocketContext);

    const changeName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        const val = e.target.value;
        if (val == '') {
            setNameStatus('error');
        } else {
            setNameStatus('');
        }

        setIsProposalAccepted(false);
        setConfigProposal(undefined);
        setIsLoading(true);
        setName(e.target.value);

        const config = configProvider.getConfig();
        config.websiteConfig.name = val;
        configProvider.setConfig(config);

        // load the config if existing
        getConfig(socket, val, (data: ScrapingConfig | undefined) => {
            setIsLoading(false);
            if (data !== undefined) {
                setConfigProposal(data);
            }
        });

        // callback the parent 
        // so that it is warned of the change
        onLoaded();
    };


    const selectProposal = () => {
        if (configProposal !== undefined) {
            configProvider.setConfig(configProposal);
            setIsProposalAccepted(true);
            setConfigProposal(undefined);
            onLoaded();
        }
    }


    /**
     * pre-fill the config fields
     * but never update them in the useEffect
     * otherwise you'll have weird behaviours
     * prefer to udpate the config directly when changing the input values
     */
    useEffect(() => {
        const config = configProvider.getConfig();
        setName(config?.websiteConfig?.name);
    }, [configProvider]);

    return (

        <Space size="large" direction="vertical" style={{ 'width': '100%' }}>

            <h2>
                {isProposalAccepted
                    ? t('configure.edit_config_title', { 'name': configProvider.getConfig().websiteConfig.name })
                    : t('configure.name_input_title')
                }
            </h2>
            <em>{t('configure.name_input_subtitle')}</em>

            <Input size="large" status={nameStatus} onChange={changeName} value={name} placeholder={t('configure.name_placeholder')} />
            {nameStatus == 'error' && <em className="error">{t('configure.name_input_invalid')}</em>}

            {
                isLoading &&
                <Space direction="horizontal" size="middle">
                    <Spin></Spin>
                    <span>{t('loading')}</span>
                </Space>
            }

            {
                configProposal &&
                <Space direction="vertical" size="middle">
                    {t('configure.proposal')}
                    <Button size='large' onClick={selectProposal}>{t('configure.select_proposal')}</Button>

                </Space>
            }
        </Space>

    );
};


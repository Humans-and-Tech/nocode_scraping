import React, { useState, useContext } from "react";
import { Input, Space } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import isURL from 'validator/lib/isURL';

import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'
import './Configurator.scoped.css';
import { config } from "process";

const { TextArea } = Input;


export const PageURLConfigurator = (): JSX.Element => {

    const { t } = useTranslation("configurator");

    const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

    const [url, setUrl] = useState<string>('');
    const [status, setStatus] = useState<'error' | 'sucess' | undefined>(undefined);

    const changeUrl = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const val = e.target.value;
        if (isURL(val) || val == '') {
            setUrl(val);
            if (val !== '') {
                setStatus('sucess');
            } else {
                setStatus(undefined);
            }
        } else {
            setUrl('');
            setStatus('error');
        }

        // update the config in the local storage
        const conf = configProvider.getConfig();
        conf.pageUrl = e.target.value;
        configProvider.setConfig(conf);
    };


    /**
     * initialize the page url
     * with the config
     */
    useEffect(() => {

        const conf = configProvider.getConfig();
        if (conf.pageUrl !== undefined) {
            setUrl(conf.pageUrl);
        }

    }, [configProvider]);

    return (
        <>
            <TextArea rows={2} onChange={changeUrl} value={url}></TextArea>
            <em>
                {
                    status == 'error' &&
                    <Space direction="horizontal" align="start" className="error"><CloseCircleOutlined /><span>{t('page_url.error')}</span></Space>
                }
                {
                    status && status !== 'error' &&
                    <Space direction="horizontal" align="start" className="success"><CheckCircleOutlined /><span>{t('page_url.success')}</span></Space>
                }
            </em>
        </>

    );
};



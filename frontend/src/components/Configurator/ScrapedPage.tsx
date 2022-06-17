import React, { useState, useContext } from "react";
import { Input, Space } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import isURL from 'validator/lib/isURL';

import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'
import './Configurator.scoped.css';

const { TextArea } = Input;

export const PageURLConfigurator = (): JSX.Element => {
    const { t } = useTranslation("configurator");

    const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

    const [url, setUrl] = useState<string>('');
    const [status, setStatus] = useState<'error' | 'sucess' | undefined>(undefined);

    const changeUrl = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const val = e.target.value;
        if (isURL(val)) {
            setUrl(val);
            setStatus('sucess');
        } else {
            setUrl('');
            setStatus('error');
        }
    };


    /**
     * update the config on URL change
     */
    useEffect(() => {

        let conf = configProvider.getConfig();
        if (url !== '') {

            if (conf !== null) {
                conf.pageUrl = url;
            } else {
                // generate a new config
                conf = {
                    websiteConfig: {},
                    pageUrl: url
                }
            }
            configProvider.setConfig(conf);
        }

    }, [url]);

    return (
        <>
            <TextArea rows={2} onChange={changeUrl}></TextArea>
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



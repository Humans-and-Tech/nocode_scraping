import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Input, Space } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import isURL from 'validator/lib/isURL';
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { Spider } from '../../interfaces/spider'
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext'
import './SpiderConfig.scoped.css';


const { TextArea } = Input;


export const SampleURL = (): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { name } = useParams();

    const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

    const socket = useContext<Socket>(SocketContext);

    const [spider, setSpider] = useState<Spider | undefined>(undefined);

    const [url, setUrl] = useState<URL | undefined>(undefined);
    const [status, setStatus] = useState<'error' | 'sucess' | undefined>(undefined);

    const changeUrl = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {

        const val = e.target.value;

        if (isURL(val) && val == '') {
            setUrl(new URL(val));
            setStatus('sucess');

        } else {
            setUrl(undefined);
            setStatus('error');
        }

        if (spider !== undefined) {
            spider.sampleURLs?.push(new URL(val));
            spiderProvider.upsert(socket, spider, (b: boolean) => {
                console.log("upsert succesful, notify the user");
            });
        }
    };


    /**
     * initialize the page url
     * with the config
     */
    useEffect(() => {

        if (name !== undefined) {
            spiderProvider.get(socket, name, (data: Spider | undefined) => {
                if (data !== null && data !== undefined) {
                    setSpider(data);
                }
            });

        }

    }, [spiderProvider, name]);

    return (
        <>
            <TextArea rows={2} onChange={changeUrl} value={url?.toString()}></TextArea>
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



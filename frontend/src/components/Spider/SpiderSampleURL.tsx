import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Input, Space, Anchor } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import isURL from 'validator/lib/isURL';
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";

import { Spider } from '../../interfaces/spider'
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext'
import './SpiderConfig.scoped.css';
import { t } from "i18next";


const { TextArea } = Input;

const { Link } = Anchor;

enum DisplayMode {
    VIEW = "view",
    EDIT = "edit"
}

/**
 * manages the sampleUrl prop of a spider
 * 
 * @returns 
 */
export const SpiderSampleURL = (): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { name } = useParams();

    const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

    const socket = useContext<Socket>(SocketContext);

    const [spider, setSpider] = useState<Spider | undefined>(undefined);
    const [url, setUrl] = useState<URL | undefined>(undefined);
    const [status, setStatus] = useState<'error' | 'sucess' | undefined>(undefined);
    const [mode, setMode] = useState<DisplayMode>(DisplayMode.VIEW);


    const changeDisplayMode = (): void => (
        (mode == DisplayMode.VIEW)
            ? setMode(DisplayMode.EDIT)
            : setMode(DisplayMode.VIEW)
    );

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

    const onConfigured = (p: Spider) => {
        setSpider(p);
    };

    return (
        <>
            {
                (mode == DisplayMode.VIEW)
                    ?
                    <Space direction="vertical" size="middle">
                        <span data-testid="sample-url-view-mode">{t('there are x sample urls')}{spider?.sampleURLs?.length}</span>
                        <Anchor onClick={changeDisplayMode}>
                            <Link href="#" title={t('toto')}></Link>
                        </Anchor>
                    </Space>
                    :
                    // <ConfigSidebar >
                    //     {t('edit sample urls')}
                    // </ConfigSidebar>
                    <>{t('todo')}</>
            }
        </>
    );
};



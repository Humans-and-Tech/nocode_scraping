import React, { useContext, useState } from "react";
import {
    Space,
    Input,
    Spin,
    Button
} from "antd";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { Spider } from '../../interfaces/spider'
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext';


import "./SpiderConfig.scoped.css"


interface SeachSpiderProps {
    onLoaded: (spider: Spider) => void;
    onChange: (val: string) => void;
}


export const SearchSpider = (props: SeachSpiderProps): JSX.Element => {

    const { t } = useTranslation("onboarding");

    const { onLoaded, onChange } = props;

    const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

    const socket = useContext<Socket>(SocketContext);

    const [isProposalAccepted, setIsProposalAccepted] = useState<boolean | undefined>(undefined);

    const [spiderProposal, setSpiderProposal] = useState<Spider | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [name, setName] = useState<string | undefined>('');

    const [nameStatus, setNameStatus] = useState<'' | 'error'>('');

    const changeName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        const val = e.target.value;

        if (val == '') {
            setNameStatus('error');
        } else {
            setNameStatus('');
        }

        setIsProposalAccepted(false);
        setIsLoading(true);
        setName(e.target.value);

        if (val !== '') {
            spiderProvider.get(socket, val, (data: Spider | undefined) => {
                if (data !== null && data !== undefined) {
                    setSpiderProposal(data);
                }
            });

        }

        setIsLoading(false);

        // transmit the user input
        // to the parent component
        onChange(val);

    };

    const selectProposal = () => {
        if (spiderProposal !== undefined) {
            setIsProposalAccepted(true);
            onLoaded(spiderProposal);
        }
    }


    return (

        <Space size="large" direction="vertical" style={{ 'width': '100%' }}>

            <h2>
                {isProposalAccepted
                    ? t('configure.edit_config_title', { 'name': spiderProposal?.name })
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
                spiderProposal &&
                <Space direction="vertical" size="middle">
                    {t('configure.proposal')}
                    <Button size='large' onClick={selectProposal}>{t('configure.select_proposal')}</Button>

                </Space>
            }
        </Space>

    );
};


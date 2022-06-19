import React, { useState } from "react";
import { Space, Switch, Input } from "antd";
import { useTranslation } from "react-i18next";


import './Alterators.scoped.css';


export const RemoveCharAlterator = (): JSX.Element => {

    const { t } = useTranslation("alterators");

    const [isChecked, setIsChecked] = useState<boolean>(false);

    const [nameStatus, setNameStatus] = useState<'' | 'error'>('');

    const [character, setCharacter] = useState<string>('');

    const onSelection = (checked: boolean) => {
        setIsChecked(checked);
    };

    const onChangeCharacter = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('onChangeCharacter', e.target.value);
    };


    return (
        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            <Space direction="horizontal" size="middle">
                <Switch onChange={onSelection} checked={isChecked} /><h4>{t('remove_char.title')}</h4>
            </Space>
            {
                isChecked &&
                <>
                    <span>{t('remove_char.input_label')}</span>
                    <Input size="large" status={nameStatus} onChange={onChangeCharacter} value={character} placeholder={t('remove_char.placeholder')} />
                </>
            }

        </Space>
    );
}



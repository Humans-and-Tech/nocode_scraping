import React, { useState } from 'react';
import { Space, Switch, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { Data } from '../../../interfaces/spider';

import './Sweepers.scoped.css';

export const RemoveCharSweeper = ({ data }: { data: Data }): JSX.Element => {
  const { t } = useTranslation('sweepers');

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
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <p>{data.name}</p>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('remove_char.title')}</h4>
      </Space>
      {isChecked && (
        <>
          <span>{t('remove_char.sample_data_label')}</span>
          <Input
            size="large"
            status={nameStatus}
            onChange={onChangeCharacter}
            value={character}
            placeholder={t('remove_char.placeholder')}
          />
          <span>{t('remove_char.remove_at_index_label')}</span>
          <Input
            size="large"
            status={nameStatus}
            onChange={onChangeCharacter}
            value={character}
            placeholder={t('remove_char.placeholder')}
          />
          <span dangerouslySetInnerHTML={{ __html: t('remove_char.result', { value: '3' }) }}></span>
        </>
      )}
    </Space>
  );
};

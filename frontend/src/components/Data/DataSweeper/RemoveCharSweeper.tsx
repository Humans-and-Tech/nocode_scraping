import React, { useState } from 'react';
import { Space, Switch, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import isNumeric from 'validator/lib/isNumeric';


import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (value: number | undefined) => void;
}

export const RemoveCharSweeper = ({ onConfigured }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [characterIndex, setCharacterIndex] = useState<string | undefined>('');

  const [validationStatus, setValidationStatus] = useState<'error' | ''>('');

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      setCharacterIndex('');
      onConfigured(undefined);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isNumeric(e.target.value)) {
      setValidationStatus('error');
      setCharacterIndex('');
    } else {
      setCharacterIndex(val);
      setValidationStatus('');
      onConfigured(parseInt(e.target.value));
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('remove_char.title')}</h4>
      </Space>
      {isChecked && (
        <>
          <span>{t('remove_char.remove_at_index_label')}</span>
          <Input
            size="large"
            status={validationStatus}
            onChange={handleChange}
            value={characterIndex}
            placeholder={t('remove_char.placeholder')}
          />
        </>
      )}
    </Space>
  );
};

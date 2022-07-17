import React, { useEffect, useState } from 'react';
import { Space, Switch, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (replaced: string | undefined, replacedBy: string | undefined) => void;
}

export const ReplaceCharSweeper = ({ onConfigured }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [replaced, setReplaced] = useState<string | undefined>(undefined);
  const [replacedBy, setReplacedBy] = useState<string | undefined>(undefined);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined, undefined);
    }
  };

  const handleReplacedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplaced(val);
  };

  const handleReplacedByChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplacedBy(val);
  };

  useEffect(() => {
    onConfigured(replaced, replacedBy);
  }, [isChecked, replaced, replacedBy]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('replace_char.title')}</h4>
      </Space>
      {isChecked && (
        <>
          <span>{t('replace_char.replace_input_label')}</span>
          <Input
            size="large"
            onChange={handleReplacedChange}
            value={replaced}
            placeholder={t('replace_char.replace_placeholder')}
          />
          <span>{t('replace_char.replace_by_input_label')}</span>
          <Input
            size="large"
            onChange={handleReplacedByChange}
            value={replacedBy}
            placeholder={t('replace_char.replace_by_placeholder')}
          />
        </>
      )}
    </Space>
  );
};

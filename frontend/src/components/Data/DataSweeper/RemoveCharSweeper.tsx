import React, { useState, useEffect } from 'react';
import { Space, Switch, Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (value: number | undefined) => void;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

export const RemoveCharSweeper = ({ onConfigured }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ charIndex: number }>();

  const charIndexValue = Form.useWatch('charIndex', form);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined);
    }
  };

  useEffect(() => {
    onConfigured(charIndexValue);
  }, [charIndexValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('remove_char.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off">
          <Form.Item label={t('remove_char.remove_at_index_label')} name="charIndex">
            <InputNumber />
          </Form.Item>
        </Form>
      )}
    </Space>
  );
};

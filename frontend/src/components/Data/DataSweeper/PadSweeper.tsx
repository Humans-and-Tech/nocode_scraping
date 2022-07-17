import React, { useEffect, useState } from 'react';
import { Space, Switch, Input, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IPadSweeperProps {
  onConfigured: (append: string | undefined, prepend: string | undefined) => void;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

export const PadSweeper = ({ onConfigured }: IPadSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ append: string; prepend: string }>();

  const appendValue = Form.useWatch('append', form);

  const prependValue = Form.useWatch('prepend', form);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined, undefined);
    }
  };

  useEffect(() => {
    onConfigured(appendValue, prependValue);
  }, [appendValue, prependValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('pad_chars.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off">
          <Form.Item label={t('pad_chars.prepend_label')} name="prepend">
            <Input />
          </Form.Item>

          <Form.Item label={t('pad_chars.append_label')} name="append">
            <Input />
          </Form.Item>
        </Form>
      )}
    </Space>
  );
};

import React, { useEffect, useState } from 'react';
import { Space, Switch, Input, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IPadSweeperProps {
  onConfigured: (regex: string | undefined) => void;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

export const ExtractData = ({ onConfigured }: IPadSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ regex: string }>();

  const regexValue = Form.useWatch('regex', form);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined);
    }
  };

  useEffect(() => {
    onConfigured(regexValue);
  }, [regexValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('regex.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off" labelWrap>
          <Form.Item label={t('regex.label')} name="regex" hasFeedback>
            <Input placeholder="I'm the content is being validated" />
          </Form.Item>
        </Form>
      )}
    </Space>
  );
};

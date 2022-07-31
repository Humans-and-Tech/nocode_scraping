import React, { useEffect, useState } from 'react';
import { Space, Switch, Input, Form, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IPadSweeperProps {
  onConfigured: (regex: string | undefined) => void;
  testdata: string | undefined;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

export const ExtractData = ({ onConfigured, testdata }: IPadSweeperProps): JSX.Element => {
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
    if (isChecked) {
      onConfigured(regexValue);
    } else {
      onConfigured(undefined);
    }
  }, [testdata, regexValue, isChecked]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('regex.title')}</h4>
      </Space>
      {isChecked && (
        <>
          <span dangerouslySetInnerHTML={{ __html: t('regex.intro') }}></span>
          <Form form={form} {...layout} autoComplete="off" labelWrap>
            <Form.Item label={t('regex.label')} name="regex">
              <Input placeholder={t('regex.placeholder')} />
            </Form.Item>
          </Form>
        </>
      )}
    </Space>
  );
};

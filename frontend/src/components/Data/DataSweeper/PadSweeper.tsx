import React, { useEffect, useState } from 'react';
import { Space, Switch, Input, Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IPadSweeperProps {
  onConfigured: (val: string | undefined) => void;
  testdata: string;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const PadSweeper = ({ onConfigured, testdata }: IPadSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ append: string; prepend: string }>();

  const appendValue = Form.useWatch('append', form);

  const prependValue = Form.useWatch('prepend', form);

  const [contentAfter, setContentAfter] = useState<string>('');

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined);
    }
  };

  useEffect(() => {
    if ((appendValue || prependValue) && testdata) {
      let finalString = testdata;
      if (prependValue) {
        finalString = prependValue.concat(finalString);
      }
      if (appendValue) {
        finalString = finalString.concat(appendValue);
      }
      setContentAfter(finalString);
      onConfigured(finalString);
    }
  }, [appendValue, prependValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('pad_chars.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off" labelWrap>
          <Form.Item label={t('pad_chars.prepend_label')} name="prepend">
            <Input placeholder={t('pad_chars.prepend_placeholder')} />
          </Form.Item>

          <Form.Item label={t('pad_chars.append_label')} name="append">
            <Input placeholder={t('pad_chars.append_placeholder')} />
          </Form.Item>
          {contentAfter && (
            <>
              {t('sweeper_result_intro')}
              <Text code>{contentAfter}</Text>
            </>
          )}
        </Form>
      )}
    </Space>
  );
};

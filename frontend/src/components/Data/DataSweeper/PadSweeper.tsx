import React, { useEffect, useState } from 'react';
import { Space, Input, Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

export interface PadFormState {
  appendValue: string | undefined;
  prependValue: string | undefined;
}

interface IPadSweeperProps {
  onConfigured: (state: PadFormState, val: string | undefined) => void;
  testdata: string | undefined;
  initialState?: PadFormState;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const PadSweeper = ({ onConfigured, testdata, initialState }: IPadSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [form] = Form.useForm<{ append: string; prepend: string }>();

  const appendValue = Form.useWatch('append', form);

  const prependValue = Form.useWatch('prepend', form);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

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
      onConfigured(
        {
          appendValue: appendValue,
          prependValue: prependValue
        },
        finalString
      );
    }
  }, [testdata, appendValue, prependValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography>
        <h5>{t('pad_chars.title')}</h5>
      </Typography>
      <Form
        form={form}
        initialValues={{ append: initialState?.appendValue, prepend: initialState?.prependValue }}
        autoComplete="off"
        labelWrap
        {...layout}
      >
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
    </Space>
  );
};

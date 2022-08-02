import React, { useEffect } from 'react';
import { Space, Input, Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

export interface RegexFormState {
  regexValue: string | undefined;
}

interface IPadSweeperProps {
  onConfigured: (state: RegexFormState, regex: string | undefined) => void;
  testdata: string | undefined;
  initialState: RegexFormState;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const ExtractData = ({ onConfigured, testdata, initialState }: IPadSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [form] = Form.useForm<{ regex: string }>();

  const regexValue = Form.useWatch('regex', form);

  useEffect(() => {
    if (regexValue && testdata) {
      onConfigured({ regexValue: regexValue }, regexValue);
    }
  }, [testdata, regexValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography>
        <h5>{t('regex.title')}</h5>
      </Typography>
      <span dangerouslySetInnerHTML={{ __html: t('regex.intro') }}></span>
      <Form form={form} initialValues={{ regex: initialState?.regexValue }} autoComplete="off" labelWrap {...layout}>
        <Form.Item label={t('regex.label')} name="regex">
          <Input placeholder={t('regex.placeholder')} />
        </Form.Item>

        {regexValue && (
          <>
            <Text italic>{t('regex.outro')}</Text>
          </>
        )}
      </Form>
    </Space>
  );
};

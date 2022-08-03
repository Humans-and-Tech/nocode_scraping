import React, { useEffect } from 'react';
import { Space, Input, Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { RegexSweeperType, SweeperFunctionType } from '../../../interfaces/spider';
import './Sweepers.scoped.css';

interface IPadSweeperProps {
  onConfigured: (state: RegexSweeperType, regex: string | undefined) => void;
  testdata: string | undefined;
  initialState?: RegexSweeperType;
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
      onConfigured(
        {
          key: SweeperFunctionType.regex,
          params: {
            regex: regexValue
          }
        },
        regexValue
      );
    }
  }, [testdata, regexValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography>
        <h5>{t('regex.title')}</h5>
      </Typography>
      <span dangerouslySetInnerHTML={{ __html: t('regex.intro') }}></span>
      <Form form={form} initialValues={{ regex: initialState?.params?.regex }} autoComplete="off" labelWrap {...layout}>
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

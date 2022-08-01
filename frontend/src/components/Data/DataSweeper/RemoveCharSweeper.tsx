import React, { useState, useEffect } from 'react';
import { Space, Form, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

export interface RemoveFormState {
  charIndexValue: number | undefined;
}

interface IRemoveCharSweeperProps {
  onConfigured: (state: RemoveFormState, value: string | undefined) => void;
  testdata: string | undefined;
  initialState: RemoveFormState;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const RemoveCharSweeper = ({ onConfigured, testdata, initialState }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [form] = Form.useForm<{ charIndex: number }>();

  const charIndexValue = Form.useWatch('charIndex', form);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (charIndexValue && testdata) {
      const finalString =
        testdata.substring(0, charIndexValue - 1) + testdata.substring(charIndexValue, testdata.length);
      setContentAfter(finalString);
      onConfigured(
        {
          charIndexValue: charIndexValue
        },
        finalString
      );
    }
    // else if (testdata) {
    //   setContentAfter(testdata);
    //   onConfigured(testdata);
    // }
  }, [testdata, charIndexValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Form
        form={form}
        initialValues={{ charIndex: initialState?.charIndexValue }}
        autoComplete="off"
        labelWrap
        {...layout}
      >
        <Form.Item label={t('remove_char.remove_at_index_label')} name="charIndex">
          <InputNumber />
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

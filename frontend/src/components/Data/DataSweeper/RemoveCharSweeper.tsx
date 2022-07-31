import React, { useState, useEffect } from 'react';
import { Space, Switch, Form, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (value: string | undefined) => void;
  testdata: string | undefined;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const RemoveCharSweeper = ({ onConfigured, testdata }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ charIndex: number }>();

  const charIndexValue = Form.useWatch('charIndex', form);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined);
    }
  };

  useEffect(() => {
    if (isChecked) {
      if (charIndexValue && testdata) {
        const finalString =
          testdata.substring(0, charIndexValue - 1) + testdata.substring(charIndexValue, testdata.length);
        setContentAfter(finalString);
        onConfigured(finalString);
      } else if (testdata) {
        setContentAfter(testdata);
        onConfigured(testdata);
      }
    } else {
      setContentAfter(undefined);
      onConfigured(undefined);
    }
  }, [testdata, charIndexValue, isChecked]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('remove_char.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off" labelWrap>
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
      )}
    </Space>
  );
};

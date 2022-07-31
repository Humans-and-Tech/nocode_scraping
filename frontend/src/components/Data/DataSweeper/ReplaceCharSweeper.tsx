import React, { useEffect, useState } from 'react';
import { Space, Switch, Form, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (val: string | undefined) => void;
  testdata: string | undefined;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const ReplaceCharSweeper = ({ onConfigured, testdata }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [form] = Form.useForm<{ replaced: string; replacedBy: string }>();

  const replacedValue = Form.useWatch('replaced', form);
  const replacedByValue = Form.useWatch('replacedBy', form);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  const onSelection = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      onConfigured(undefined);
    }
  };

  useEffect(() => {
    if (isChecked) {
      if (replacedValue && replacedByValue && testdata) {
        const finalString = testdata.replace(replacedValue, replacedByValue);
        setContentAfter(finalString);
        onConfigured(finalString);
      }
    } else {
      setContentAfter(undefined);
      onConfigured(undefined);
    }
  }, [testdata, isChecked, replacedValue, replacedByValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space direction="horizontal" size="middle">
        <Switch onChange={onSelection} checked={isChecked} />
        <h4>{t('replace_char.title')}</h4>
      </Space>
      {isChecked && (
        <Form form={form} {...layout} autoComplete="off" labelWrap>
          <Form.Item label={t('replace_char.replaced_placeholder')} name="replaced">
            <Input placeholder={t('replace_char.replaced_placeholder')} />
          </Form.Item>

          <Form.Item label={t('replace_char.replaced_by_input_label')} name="replacedBy">
            <Input placeholder={t('replace_char.replaced_by_placeholder')} />
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

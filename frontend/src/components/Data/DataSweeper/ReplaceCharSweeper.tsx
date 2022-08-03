import React, { useEffect, useState } from 'react';
import { Space, Form, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { ReplaceSweeperType, SweeperFunctionType } from '../../../interfaces/spider';
import './Sweepers.scoped.css';

interface IRemoveCharSweeperProps {
  onConfigured: (state: ReplaceSweeperType, value: string) => void;
  testdata: string | undefined;
  initialState?: ReplaceSweeperType;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 }
};

const { Text } = Typography;

export const ReplaceCharSweeper = ({ onConfigured, testdata, initialState }: IRemoveCharSweeperProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const [form] = Form.useForm<{ replaced: string; replacedBy: string }>();

  const replacedValue = Form.useWatch('replaced', form);
  const replacedByValue = Form.useWatch('replacedBy', form);

  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (replacedValue && replacedByValue && testdata) {
      const finalString = testdata.replace(replacedValue, replacedByValue);
      setContentAfter(finalString);
      onConfigured(
        {
          key: SweeperFunctionType.replaceChar,
          params: {
            replaced: replacedValue,
            replacedBy: replacedByValue
          }
        },
        finalString
      );
    }
  }, [testdata, replacedValue, replacedByValue]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography>
        <h5>{t('replace_char.title')}</h5>
      </Typography>
      <Form
        form={form}
        initialValues={{ replaced: initialState?.params?.replaced, replacedBy: initialState?.params?.replacedBy }}
        autoComplete="off"
        labelWrap
        {...layout}
      >
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
    </Space>
  );
};

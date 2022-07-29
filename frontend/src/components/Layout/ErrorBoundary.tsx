import { Alert } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ErrorFallback = ({ error }: { error: Error }): JSX.Element => {
  const { t } = useTranslation('layout');
  return (
    <>
      <Alert
        message={t('errors.title')}
        description={t('errors.description', { message: error.message })}
        type="error"
      />
    </>
  );
};

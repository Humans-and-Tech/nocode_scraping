import React from 'react';
import { Space, Image } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';

import '../Data.scoped.css';

interface ISelectorEvalPropsType {
  content: ScrapingResponse | ScrapingError | undefined;
  showScreenshot: boolean;
}

/**
 * this component offers a preview of the content scraped with both the content itself
 * and a screenshot when available
 *
 * it displays also a message in case of ScrapingStatus which is not successful
 *
 * @param props
 * @returns JSX.Element
 */
export const PreviewContent = (props: ISelectorEvalPropsType): JSX.Element => {
  const { t } = useTranslation('configurator');

  const { content, showScreenshot } = props;

  return (
    <>
      {content && content.status == ScrapingStatus.SUCCESS && (
        <Space data-testid="preview-success-message" direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <CheckCircleOutlined className="success"></CheckCircleOutlined>
            <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.result', { value: content.content }) }}></span>
          </Space>
          {content.screenshot !== undefined && showScreenshot && (
            <>
              <h4>{t('field.evaluation.screenshot')}</h4>
              <Image data-testid="preview-screenshot" width={200} src={content.screenshot}></Image>
            </>
          )}
          {content.parentPage.isCached ? (
            <Space direction="horizontal">
              <InfoCircleOutlined></InfoCircleOutlined>
              <span>
                {t('field.evaluation.cached_version', {
                  date: dayjs(content.parentPage.lastScrapedDate).format('MMMM D')
                })}
              </span>
            </Space>
          ) : (
            <Space direction="horizontal">
              <InfoCircleOutlined></InfoCircleOutlined>
              <span>{t('field.evaluation.fresh_version')}</span>
            </Space>
          )}
        </Space>
      )}
      {content && content.status == ScrapingStatus.INVALID_SELECTOR && (
        <Space
          data-testid="preview-invalid-selector-message"
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            <span
              dangerouslySetInnerHTML={{
                __html: t('field.evaluation.invalid_selector', { selector: content.selector.path })
              }}
            ></span>
          </Space>
        </Space>
      )}
      {content && content.status == ScrapingStatus.NO_CONTENT && (
        <Space data-testid="preview-no-content-message" direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            <span
              dangerouslySetInnerHTML={{
                __html: t('field.evaluation.no_content', { selector: content.selector.path })
              }}
            ></span>
          </Space>
        </Space>
      )}
      {content && content.status == ScrapingStatus.ELEMENT_NOT_FOUND && (
        <Space data-testid="preview-not-found-message" direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            {content.selector !== undefined ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: t('field.evaluation.no_popup', { selector: content.selector.path })
                }}
              ></span>
            ) : (
              <span>{t('field.evaluation.failure_unknown', { message: content.message })}</span>
            )}
          </Space>
        </Space>
      )}
      {content && content.status == ScrapingStatus.ERROR && (
        <Space data-testid="preview-error-message" direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <CloseCircleOutlined className="error"></CloseCircleOutlined>
            {content.selector !== undefined ? (
              <span
                dangerouslySetInnerHTML={{ __html: t('field.evaluation.failure', { selector: content.selector.path }) }}
              ></span>
            ) : (
              <span>{t('field.evaluation.failure_unknown', { message: content.message })}</span>
            )}
          </Space>
        </Space>
      )}
    </>
  );
};

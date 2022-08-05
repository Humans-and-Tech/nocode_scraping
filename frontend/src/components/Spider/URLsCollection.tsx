import React, { useState } from 'react';
import { Space, List, Button, Input, Typography, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import isURL from 'validator/lib/isURL';

import { Spider, URLsCollection } from '../../interfaces/spider';
import { createUrlsCollection } from '../../api/spider';
import { displayMessage, NotificationLevel } from '../Layout/UserNotification';

import './SpiderConfig.scoped.css';

const { TextArea } = Input;

interface SpiderState {
  current: Spider;
}

export const URLsCollectionsConfig = (): JSX.Element => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <URLsListForm />
      <URLsCollectionsList />
    </Space>
  );
};

export const URLsCollectionsList = (): JSX.Element => {
  const { t } = useTranslation('configurator');

  const localSpider = useSelector((state: SpiderState) => state.current);

  const deleteCollection = (item: URLsCollection) => {
    console.log('deleteCollection', item.name);
  };

  return (
    <>
      {localSpider && (
        <List
          size="large"
          bordered
          dataSource={localSpider.urlsCollections}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key={`delete-${item.name}`}
                  onClick={() => {
                    deleteCollection(item);
                  }}
                >
                  {t('spider.actions.delete')}
                </a>
              ]}
            >
              {item.name} (<Typography.Text italic>{item.urls?.length} URLs</Typography.Text>)
            </List.Item>
          )}
        />
      )}
    </>
  );
};

export const URLsListForm = ({ ...rest }): JSX.Element => {
  const { t } = useTranslation('configurator');

  const localSpider = useSelector((state: SpiderState) => state.current);

  const [form] = Form.useForm<{ collectionName: string; urlsList: string }>();

  const [listStatus, setListStatus] = useState<'success' | 'warning' | 'error' | undefined>(undefined);

  const onCheck = async () => {
    const urlsList = form.getFieldValue('urlsList')?.split(/\r?\n/);
    if (urlsList) {
      let formValid = urlsList.every((element: string) => {
        if (!isURL(element)) {
          setListStatus('error');
          return false;
        }
        return true;
      });

      const name = form.getFieldValue('collectionName');
      if (!name || name == '') {
        formValid = false;
      }

      if (formValid) {
        const dto = {
          name: form.getFieldValue('collectionName'),
          urlsList: urlsList
        };

        createUrlsCollection(localSpider, dto)
          .then(() => {
            displayMessage(NotificationLevel.SUCCESS, t('spider.actions.add_collection_success'));
          })
          .catch(() => {
            displayMessage(NotificationLevel.ERROR, t('spider.actions.add_collection_error'));
          });
      }
    }
  };

  return (
    <>
      {localSpider && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Title level={5}>{t('spider.config_sidebar.add_urls_collection')}</Typography.Title>
          <Form form={form} autoComplete="off" labelWrap layout="vertical">
            <Form.Item
              label={t('spider.config_sidebar.form_coll_name_label')}
              name="collectionName"
              required
              hasFeedback
            >
              <Input placeholder={t('spider.config_sidebar.form_coll_name_placeholder')} />
            </Form.Item>

            <Form.Item
              label={t('spider.config_sidebar.form_urls_list_label')}
              name="urlsList"
              required
              validateStatus={listStatus}
              help={t('spider.config_sidebar.form_urls_list_helper')}
            >
              <TextArea rows={4} placeholder={t('spider.config_sidebar.form_urls_list_placeholder')} {...rest} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={onCheck}>
                {t('spider.config_sidebar.form_submit')}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      )}
    </>
  );
};

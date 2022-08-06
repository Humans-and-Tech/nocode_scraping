import React, { useState } from 'react';
import { Space, List, Button, Input, Typography, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Async from 'react-async';

import isURL from 'validator/lib/isURL';

import { setSpider } from '../../spiderSlice';
import { Spider } from '../../interfaces/spider';
import { getSpider } from '../../api/spider';
import { createUrlsCollection, deleteUrlsCollection, getCollection } from '../../api/urls-collections';
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

  const dispatch = useDispatch();

  const deleteCollection = (key: string) => {
    deleteUrlsCollection(key)
      .then(() => {
        // refresh the spider
        // and store it
        getSpider(localSpider.name)
          .then((s: Spider) => {
            displayMessage(NotificationLevel.SUCCESS, t('spider.actions.delete_collection_success'));
            dispatch(setSpider(s));
          })
          .catch(() => {
            displayMessage(NotificationLevel.ERROR, t('spider.actions.delete_collection_error'));
          });
      })
      .catch(() => {
        displayMessage(NotificationLevel.ERROR, t('spider.actions.delete_collection_error'));
      });
  };

  const getCollectionDetails = async (key: string) => {
    return await getCollection(key);
  };

  return (
    <>
      {localSpider && (
        <List
          size="large"
          bordered
          dataSource={localSpider.urlsCollections}
          renderItem={(key: string) => (
            <List.Item
              actions={[
                <a
                  key={`delete-${key}`}
                  onClick={() => {
                    deleteCollection(key);
                  }}
                >
                  {t('spider.actions.delete')}
                </a>
              ]}
            >
              <Async promise={getCollectionDetails(key)}>
                {({ data }) => {
                  if (data)
                    return (
                      <>
                        <Typography.Text strong>{data.name}</Typography.Text>
                        <Typography.Text italic>({data.urlsList?.length} URLs)</Typography.Text>
                      </>
                    );
                  return null;
                }}
              </Async>
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
  const dispatch = useDispatch();

  const [form] = Form.useForm<{ collectionName: string; urlsList: string }>();

  const [listStatus, setListStatus] = useState<'success' | 'warning' | 'error' | undefined>(undefined);
  const [nameStatus, setNameStatus] = useState<'success' | 'warning' | 'error' | undefined>(undefined);

  /**
   * if the form is valid, stores the urlsCollection in the spider
   * then refreshes the spider in the redux store
   */
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
        setNameStatus('error');
      }

      if (formValid) {
        setNameStatus('success');
        setListStatus('success');

        const dto = {
          name: form.getFieldValue('collectionName'),
          spiderName: localSpider.name,
          urlsList: urlsList
        };

        createUrlsCollection(dto)
          .then(() => {
            // refresh the spider
            // and store it
            getSpider(localSpider.name)
              .then((s: Spider) => {
                displayMessage(NotificationLevel.SUCCESS, t('spider.actions.add_collection_success'));
                dispatch(setSpider(s));
              })
              .catch(() => {
                displayMessage(NotificationLevel.ERROR, t('spider.actions.add_collection_error'));
              });
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
              validateStatus={nameStatus}
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

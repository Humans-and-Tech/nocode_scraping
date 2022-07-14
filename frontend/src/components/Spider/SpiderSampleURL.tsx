import React, { useState, useContext, useEffect, useRef, Fragment } from 'react';
import { Space, List, Button, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import isURL from 'validator/lib/isURL';

import { Spider } from '../../interfaces/spider';
import { BackendContext } from '../../BackendContext';
import { IBackendServicesProvider } from '../../BackendProvider';
import { displayMessage, NotificationLevel } from '../Layout/UserNotification';

import './SpiderConfig.scoped.css';

const { TextArea } = Input;

interface ISampleUrlSelectorProps {
  spider: Spider;
  onSelect: (url: URL) => void;
  initialSelectedUrl: URL | undefined;
}

/**
 * choose / select a sample url
 *
 * @returns JSX.Element
 */
export const SampleUrlSelector = ({ spider, onSelect, initialSelectedUrl }: ISampleUrlSelectorProps): JSX.Element => {
  const { t } = useTranslation('configurator');

  const [selectedSampleUrl, setSelectedSampleUrl] = useState<string | undefined>(initialSelectedUrl?.toString());

  const onChange = (value: string) => {
    setSelectedSampleUrl(value);
    onSelect(new URL(value));
  };

  return (
    <>
      {spider.sampleURLs && (
        <Select
          style={{ width: '100%' }}
          size="middle"
          placeholder={t('spider.sample_url_select_placeholder')}
          onChange={onChange}
          optionLabelProp="label"
          defaultValue={spider.sampleURLs[0].toString()}
          options={spider.sampleURLs?.map((urlString) => {
            const url = new URL(urlString);
            return {
              label: `...${url.pathname}`,
              value: url.toString()
            };
          })}
          value={selectedSampleUrl}
        ></Select>
      )}
    </>
  );
};

/**
 * Add / delete a sample url
 *
 * @returns JSX.Element
 */
export const SampleURLManager = ({ spider, ...rest }: { spider: Spider }): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  const spiderName = useRef<string>('');

  const [inputClass, setInputClass] = useState<string>('');
  const [sampleUrl, setSampleUrl] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [localSpider, setLocalSpider] = useState<Spider | undefined>(undefined);
  const [listLength, setListLength] = useState<number | undefined>(0);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSampleUrl(val);

    if (isURL(val)) {
      setInputClass('success');
      setIsValid(true);
    } else {
      setInputClass('error');
      setIsValid(false);
    }
  };

  const updateSpider = (_spider: Spider) => {
    backendProvider.spider.upsert(_spider, (b: boolean, err: Error | undefined) => {
      if (b) {
        setLocalSpider(_spider);
        setListLength(_spider.sampleURLs?.length);
        displayMessage(NotificationLevel.SUCCESS, t('spider.actions.update_success'));
      } else {
        console.error('upsert failed', err);
        displayMessage(NotificationLevel.ERROR, t('spider.actions.update_error'));
      }
    });
  };

  const btnText = () => {
    return !spider.sampleURLs || spider.sampleURLs?.length == 0
      ? t('spider.actions.sample_urls_add_first_one')
      : t('spider.actions.sample_urls_add_more');
  };

  const addSampleURL = () => {
    if (sampleUrl && sampleUrl !== '') {
      if (!spider.sampleURLs) {
        spider.sampleURLs = [];
      }
      spider.sampleURLs.push(new URL(sampleUrl));
      updateSpider(spider);
    }
  };

  const deleteSampleUrl = (sampleUrl: URL) => {
    const _sampleUrls = localSpider?.sampleURLs;
    localSpider?.sampleURLs?.forEach((item, index) => {
      if (item.toString() == sampleUrl.toString()) {
        // for TS
        if (_sampleUrls) {
          _sampleUrls.splice(index, 1);
        }
      }
    });
    spider.sampleURLs = _sampleUrls;
    updateSpider(spider);
  };

  /**
   * initiate the localSpider & refresh each time the sampleUrlsList changes
   * thanks to the listLength which is a dependency
   */
  useEffect(() => {
    // refreshes when spider changes
    if (spider.name !== spiderName.current) {
      spiderName.current = spider.name;
      setLocalSpider(spider);
      setListLength(spider.sampleURLs?.length);
    }
  }, [spiderName, listLength]);

  return (
    <>
      {localSpider && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <TextArea
            rows={4}
            placeholder={t('spider.sample_url_input_placeholder')}
            onBlur={onChange}
            onChange={onChange}
            value={sampleUrl}
            className={inputClass}
            {...rest}
          />
          <Button onClick={addSampleURL} type="primary" disabled={!isValid}>
            {btnText()}
          </Button>
          {localSpider.sampleURLs && (
            <List
              size="large"
              bordered
              dataSource={localSpider.sampleURLs}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      onClick={() => {
                        deleteSampleUrl(item);
                      }}
                      key="list-loadmore-edit"
                    >
                      {t('spider.actions.sample_url_delete')}
                    </a>
                  ]}
                >
                  {item.toString()}
                </List.Item>
              )}
            />
          )}
        </Space>
      )}
    </>
  );
};

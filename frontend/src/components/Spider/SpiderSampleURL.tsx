import React, { useState, useContext } from 'react';
import { Space, List, Button, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { setSpider } from '../../spiderSlice';

import isURL from 'validator/lib/isURL';
import clone from 'lodash/clone';
import { Spider } from '../../interfaces/spider';
import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';
import { displayMessage, NotificationLevel } from '../Layout/UserNotification';

import './SpiderConfig.scoped.css';

const { TextArea } = Input;

interface ISampleUrlSelectorProps {
  spider: Spider;
  onSelect: (url: URL) => void;
  initialSelectedUrl: URL | undefined;
}

interface SpiderState {
  current: Spider;
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
export const SampleURLManager = ({ ...rest }): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  const dispatch = useDispatch();
  const localSpider = useSelector((state: SpiderState) => state.current);

  const [inputClass, setInputClass] = useState<string>('');
  const [sampleUrl, setSampleUrl] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

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
    backendProvider.upsert(_spider, (b: boolean, err: Error | undefined) => {
      if (b) {
        dispatch(setSpider(_spider));
        displayMessage(NotificationLevel.SUCCESS, t('spider.actions.update_success'));
      } else {
        console.error('upsert failed', err);
        displayMessage(NotificationLevel.ERROR, t('spider.actions.update_error'));
      }
    });
  };

  const btnText = () => {
    return !localSpider.sampleURLs || localSpider.sampleURLs?.length == 0
      ? t('spider.actions.sample_urls_add_first_one')
      : t('spider.actions.sample_urls_add_more');
  };

  /**
   * localSpider coming from the redux store, it is immutable
   * hence, we create a local copy of the data to manipulate them
   *
   */
  const addSampleURL = () => {
    if (sampleUrl && sampleUrl !== '') {
      let cloneSampleUrls = clone(localSpider.sampleURLs);
      if (!cloneSampleUrls) {
        cloneSampleUrls = [];
      }
      cloneSampleUrls.push(new URL(sampleUrl));
      const cloneSpider = clone(localSpider);
      cloneSpider.sampleURLs = cloneSampleUrls;
      updateSpider(cloneSpider);
    }
  };

  /**
   * localSpider coming from the redux store, it is immutable
   * hence, we create a local copy of the data to manipulate them
   *
   * @param __sampleUrl a URL
   */
  const deleteSampleUrl = (__sampleUrl: URL) => {
    const _sampleUrls = clone(localSpider.sampleURLs);
    localSpider?.sampleURLs?.forEach((item, index) => {
      if (item.toString() == __sampleUrl.toString()) {
        // for TS
        if (_sampleUrls) {
          _sampleUrls.splice(index, 1);
        }
      }
    });
    const cloneSpider = clone(localSpider);
    cloneSpider.sampleURLs = _sampleUrls;
    updateSpider(cloneSpider);
  };

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

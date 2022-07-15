import React, { useState, useContext, useEffect, useRef } from 'react';
import { Tabs, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { Data, Spider, mergeSpiderData } from '../../interfaces/spider';
import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';
import {displayMessage, NotificationLevel} from '../../components/Layout/UserNotification'
import { SelectorConfig } from './DataSelector/SelectorConfig';

import './Data.scoped.css';

const { TabPane } = Tabs;

interface IDataConfigProps {
  data: Data;
  spider: Spider;
  onSave: () => void;
}

/**
 * Builds a UI to configure a Selector for the given scraping element
 *
 * TODO: the dataconfig embeds 3 Tabs
 * - selector config
 * - export config
 * - data definition (name, type)
 */
export const DataConfig = ({ data, spider, onSave }: IDataConfigProps): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  // keep track of the current data loaded in this component
  // so that the component states are re-init when the data change
  const dataName = useRef<string>('');

  const [localData, setLocalData] = useState<Data | undefined>(undefined);
  const [localSpider, setLocalSpider] = useState<Spider | undefined>(undefined);

  const onConfigured = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
  };

  const onDataChange = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const triggerSave = () => {
    if (localData) {
      saveSpiderData(localData);
      onSave();
      displayMessage(NotificationLevel.SUCCESS, t('spider.actions.update_success'));
    };
  };

  const saveSpiderData = (_data: Data) => {
    // update the local spider
    // when updated, the useEffect will be triggered
    // to save the spider
    if (localSpider !== undefined) {
      // merge the data into the spider
      const _spider = mergeSpiderData(localSpider, _data);

      // sync the DB
      backendProvider.upsert(_spider, (b: boolean, err: Error | undefined) => {
        if (b) {
          // and update the local state accordingly
          setLocalSpider(_spider);
        } else {
          console.error('upsert failed', err);
        }
      });
    }
  };

  useEffect(() => {
    // when mouting initially
    if (localData === undefined || data.name !== dataName.current) {
      dataName.current = data.name;
      setLocalData(data);
    }

    if (localSpider === undefined) {
      setLocalSpider(spider);
    }
  }, [data, spider]);

  const saveBtn = <Button type="primary" onClick={triggerSave}>{t('field.action.save_data_configuration')}</Button>;

  return (
    <Tabs defaultActiveKey="1" onChange={onTabChange} tabBarExtraContent={saveBtn}>
      <TabPane tab={t('spider.config_sidebar.tab_selector_config')} key="1">
        <h2>{data.label}</h2>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {
            //spider.sampleURLs && spider.sampleURLs.length > 0 &&
            localData && localSpider && (
              <SelectorConfig
                data={localData}
                spider={localSpider}
                onConfigured={onConfigured}
                onChange={onDataChange}
              />
            )
          }

          {/* {isConfigured &&
            <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
              <h2>{t('field.alterators_title')}</h2>
              <DataAlterators />
            </Space>
          } */}
        </Space>
      </TabPane>
      <TabPane tab={t('spider.config_sidebar.tab_sweepers')} key="2">
        Sweepers
      </TabPane>

    </Tabs>
  );
};

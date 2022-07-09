import React, { useState, useContext, useEffect, useRef } from 'react';
import { Tabs, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { Data, Spider, mergeSpiderData } from '../../interfaces/spider';
import { BackendContext, IBackendServicesProvider } from '../../BackendSocketContext';

import { SelectorConfig } from './DataSelector/SelectorConfig';

import './Data.scoped.css';

const { TabPane } = Tabs;

/**
 * Builds a UI to configure a Selector for the given scraping element
 *
 * TODO: the dataconfig embeds 3 Tabs
 * - selector config
 * - export config
 * - data definition (name, type)
 */
export const DataConfig = ({ data, spider }: { data: Data; spider: Spider }): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  // const socket = useContext<Socket>(ScrapingSocketContext);

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
    }
  };

  const saveSpiderData = (_data: Data) => {
    // update the local spider
    // when updated, the useEffect will be triggered
    // to save the spider
    if (localSpider !== undefined) {
      // merge the data into the spider
      const _spider = mergeSpiderData(localSpider, _data);

      // sync the DB
      backendProvider.spider.upsert(_spider, (b: boolean, err: Error | undefined) => {
        if (b) {
          console.log('data is synced');
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

  const saveBtn = <Button onClick={triggerSave}>{t('field.action.save_data_configuration')}</Button>;

  return (
    <Tabs defaultActiveKey="1" onChange={onTabChange} tabBarExtraContent={saveBtn}>
      <TabPane tab={t('tab.selector_config')} key="1">
        <h2>{data.label}</h2>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {
            //spider.sampleURLs && spider.sampleURLs.length > 0 &&
            localData && (
              <SelectorConfig
                data={localData}
                sampleUrl={
                  new URL(
                    'https://www.manomano.fr/p/piscine-tubulaire-ronde-366-x-122m-summer-waves-avec-pompe-32127122?product_id=31948595'
                  )
                }
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
      <TabPane tab={t('tab.sweepers_config')} key="2">
        Sweepers
      </TabPane>
      <TabPane tab={t('tab.exporters_config')} key="3">
        Exporters
      </TabPane>
    </Tabs>
  );
};

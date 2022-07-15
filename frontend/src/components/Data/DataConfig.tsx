import React, { useState, useContext, useEffect, useRef } from 'react';
import { Tabs, Space, Button } from 'antd';
import { GiBroom } from 'react-icons/gi';
import { BiTargetLock } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';

import { Data, Spider, mergeSpiderData, SelectorStatus } from '../../interfaces/spider';
import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';
import { displayMessage, NotificationLevel } from '../../components/Layout/UserNotification';
import { SelectorConfig } from './DataSelector/SelectorConfig';

import './Data.scoped.css';
import { DataSweepersConfig } from './DataSweeper/SweepersConfig';

const { TabPane } = Tabs;

interface IDataConfigProps {
  data: Data;
  spider: Spider;
  onSave: () => void;
}

/**
 * Builds a UI to configure a Selector for the given scraping element
 *
 */
export const DataConfig = ({ data, spider, onSave }: IDataConfigProps): JSX.Element => {
  const { t } = useTranslation('configurator');

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  // keep track of the current data loaded in this component
  // so that the component states are re-init when the data change
  const dataName = useRef<string>('');

  const [localData, setLocalData] = useState<Data | undefined>(undefined);
  const [localSpider, setLocalSpider] = useState<Spider | undefined>(undefined);
  const [isSelectorConfigured, setIsSelectorConfigured] = useState<boolean>(false);

  // for tabs changes
  const [activeKey, setActiveKey] = useState<string>('1');
  const onKeyChange = (key: string) => setActiveKey(key);

  const goToSweepersTab = () => {
    setActiveKey('2');
    console.log('goToSweepersTab');
  };

  const onConfigured = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
    setIsSelectorConfigured(true);
  };

  const onDataChange = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
  };

  const triggerSave = () => {
    if (localData) {
      saveSpiderData(localData);
      onSave();
      displayMessage(NotificationLevel.SUCCESS, t('spider.actions.update_success'));
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

      // activate the tab if the selector is oK
      if (data.selector?.status == SelectorStatus.VALID) {
        console.log('data is configured');
        setIsSelectorConfigured(true);
      }
    }
  }, [data, spider, activeKey]);

  const saveBtn = (
    <Button type="primary" onClick={triggerSave}>
      {t('field.action.save_data_configuration')}
    </Button>
  );

  return (
    <Tabs defaultActiveKey={activeKey} onChange={onKeyChange} tabBarExtraContent={saveBtn}>
      <TabPane
        tab={
          <Space>
            <BiTargetLock />
            {t('spider.config_sidebar.tab_selector_config')}
          </Space>
        }
        key="1"
      >
        <h2>{data.label}</h2>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {localData && localSpider && (
            <SelectorConfig data={localData} spider={localSpider} onConfigured={onConfigured} onChange={onDataChange} />
          )}
          {isSelectorConfigured && (
            <>
              <span>{t('spider.config_sidebar.sweep_data_cta_intro')}</span>
              {/* <Button onClick={goToSweepersTab} type="primary" data-testid="evaluation-button">
                {t('spider.config_sidebar.sweep_data_cta')}
              </Button> */}
            </>
          )}
        </Space>
      </TabPane>
      {isSelectorConfigured && (
        <TabPane
          tab={
            <Space>
              <GiBroom />
              {t('spider.config_sidebar.tab_sweepers')}
            </Space>
          }
          key="2"
        >
          {localData && <DataSweepersConfig data={localData} />}
        </TabPane>
      )}
    </Tabs>
  );
};

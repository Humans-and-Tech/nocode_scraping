import React, { useState, useContext, useRef } from 'react';
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

  console.log('DataConfig');

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  /**
   * loads the existing selector definition and its Status
   * if the status is VALID, then the selector is valid
   *
   * @returns boolean
   */
  const initIsSelectorConfigured = () => {
    // activate the tab if the selector is oK
    if (data.selector?.status == SelectorStatus.VALID) {
      return true;
    }
    return false;
  };

  const [localData, setLocalData] = useState<Data | undefined>(data);
  const [localSpider, setLocalSpider] = useState<Spider | undefined>(spider);
  const [isSelectorConfigured, setIsSelectorConfigured] = useState<boolean>(() => {
    return initIsSelectorConfigured();
  });

  // for tabs changes
  const [activeKey, setActiveKey] = useState<string>('1');
  const onKeyChange = (key: string) => setActiveKey(key);

  const goToSweepersTab = () => {
    setActiveKey('2');
  };

  const onConfigured = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
    setIsSelectorConfigured(true);
  };

  const onConfigurationError = (_data: Data): void => {
    setLocalData(_data);
    saveSpiderData(_data);
    setIsSelectorConfigured(false);
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

  /**
   * the localSpider coming from the redux store
   * we create a clone before saving its data
   *
   * @param _data Data object
   */
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
            <SelectorConfig
              data={localData}
              spider={localSpider}
              onConfigured={onConfigured}
              onConfigurationError={onConfigurationError}
              onChange={onDataChange}
            />
          )}
          {isSelectorConfigured && (
            <>
              <span className="highlight">{t('spider.config_sidebar.sweep_data_cta_intro')}</span>
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
          {localData && <DataSweepersConfig data={localData} spider={spider} onConfigured={saveSpiderData} />}
        </TabPane>
      )}
    </Tabs>
  );
};

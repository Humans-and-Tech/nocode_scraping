import React, { useState, useContext } from "react";
import { Tabs, Space, Button } from "antd";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { Data, Spider } from "../../interfaces/spider";
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext'

import { SelectorConfig } from "./SelectorConfig";
import { DataAlterators } from '../Alterators/DataAlterators'

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
export const DataConfig = ({
  data, spider
}: {
  data: Data,
  spider: Spider
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

  const socket = useContext<Socket>(SocketContext);

  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const onConfigured = (data: Data): void => {
    setIsConfigured(true);
    spider.data?.add(data);
    spiderProvider.upsert(socket, spider, (b: boolean) => {
      console.log('upsert successful');
    });
  };

  const onError = (): void => {
    setIsConfigured(false);
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const evaluate = <Button>Test this data</Button>;


  return (

    <Tabs defaultActiveKey="1" onChange={onTabChange} tabBarExtraContent={evaluate}>
      <TabPane tab={t('tab.selector_config')} key="1">
        <h2>{data.label}</h2>
        <Space direction="vertical" size="large" style={{ 'width': '100%' }}>

          {
            //spider.sampleURLs && spider.sampleURLs.length > 0 &&
            <SelectorConfig data={data} sampleUrl={new URL('https://www.manomano.fr/p/salon-de-jardin-en-imitation-resine-tressee-ensemble-de-4-meubles-livre-avec-accoudoirs-coussins-de-dossier-et-verre-32868538?model_id=32849419')} onConfigured={onConfigured} onError={onError} />
          }

          {isConfigured &&
            <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
              <h2>{t('field.alterators_title')}</h2>
              <DataAlterators />
            </Space>
          }
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



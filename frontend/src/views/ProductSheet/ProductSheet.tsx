import React, { useState } from 'react';
import { Row, Col, Breadcrumb, Rate, Image, List, Space, Tooltip, Collapse, Badge, Card } from 'antd';
import {
  HomeOutlined,
  FolderOpenOutlined,
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  HighlightOutlined,
  AmazonOutlined,
  SketchOutlined
} from '@ant-design/icons';
import { FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Data, Spider, SelectorStatus, DataGroup } from '../../interfaces/spider';
import { DataConfig } from '../../components/Data/DataConfig';
import { ConfigSidebar } from '../../components/Layout/ConfigSidebar';

import './ProductSheet.scoped.css';
import { cloneDeep } from 'lodash';

const { Panel } = Collapse;

interface IDataConfig {
  name: string;
  label: string;
  group: DataGroup;
}

interface SpiderState {
  current: Spider;
}

const ProductSheet: React.FC = () => {
  const { t } = useTranslation('product_sheet');

  const spider = useSelector((state: SpiderState) => state.current);

  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  // the data that will be passed to the config sidebar
  // will be updated when the spider is loaded and the user clicks on an element
  const [data, setData] = useState<Data | undefined>(undefined);

  /**
   * displays the config sidebar for the selected data
   * and loads the spider's data configuration if it exists
   *
   * the data is retrieved by its name attribute
   *
   * @param element
   */
  const showSideBar = (element: IDataConfig): void => {
    if (spider) {
      // load the spider data for this element
      let dataIndex = -1;
      spider.data?.forEach((d: Data, index: number) => {
        if (d.name === element.name) {
          // set the group if not set (legacy)
          const _localData = cloneDeep(d)
          _localData.group = element.group;
          dataIndex = index;
          setData(_localData);
        }
      });

      // if not retrieved, initiate a new data config with the element
      // it's Ok to do that because IDataConfig contains the mandatory props
      // of the Data interface
      if (dataIndex === -1) {
        setData(element);
      }

      setIsSideBarOpen(true);
    }
  };

  const closeSideBar = (): void => {
    setIsSideBarOpen(false);
  };

  const priceElements: Array<IDataConfig> = [
    {
      name: 'price.discount',
      label: t('product.price.discount'),
      group: DataGroup.PRICE
    },
    {
      name: 'price.recommended',
      label: t('product.price.recommended'),
      group: DataGroup.PRICE
    },
    {
      name: 'price.unit',
      label: t('product.price.unit'),
      group: DataGroup.PRICE
    },
    {
      name: 'price.currency',
      label: t('product.price.currency'),
      group: DataGroup.PRICE
    }
  ];

  /**
   * checks wether the selector is properly configured for the given data
   * identified by its name, meaning:
   * - checks if the selector is valid
   * - if a popupSelector is used, checks if it is valid
   *
   * @param item
   * @returns boolean
   */
  const isSelectorValid = (dataName: string): boolean => {
    let isConfigured = false;
    spider?.data?.forEach((d: Data) => {
      if (d.name === dataName) {
        if (d.selector && d.selector.status == SelectorStatus.VALID) {
          isConfigured = true;
        }
        return;
      }
    });
    return isConfigured;
  };

  /**
   * counts the number of data in a domain that are ready to be scraped
   *
   * @param DataGroup
   */
  const validDataCount = (dataGroup: DataGroup): number => {
    let count = 0;
    spider?.data?.forEach((d: Data) => {
      if (d.group && d.group === dataGroup) {
        if (isSelectorValid(d.name)) {
          count++;
        }
      }
    });
    return count;
  };

  return (
    <>
      {data && spider && (
        <ConfigSidebar isVisible={isSideBarOpen} onClose={closeSideBar}>
          <DataConfig data={data} spider={spider} onSave={closeSideBar} />
        </ConfigSidebar>
      )}
      {
        <Space size={['large', 0]} direction="vertical" className="gus-main-content">
          {/* <Spin spinning={isLoading} size="large" style={{ width: '100%', marginTop: '3em', marginBottom: '3em' }} /> */}
          <Row className="gus-main-row">
            <Col>
              <Row className="gus-row-breathe">
                <Col style={{ width: '100%' }}>
                  <Card title={t('scraping_groups.breadcrumb')}>
                    <Space direction="vertical" size="small">
                      <Breadcrumb>
                        <Breadcrumb.Item href="">
                          <HomeOutlined />
                        </Breadcrumb.Item>

                        <Breadcrumb.Item href="">
                          <FolderOpenOutlined />
                          <span>{t('breadcrumb.category_level_0')}</span>
                        </Breadcrumb.Item>

                        <Breadcrumb.Item href="">
                          <FolderOpenOutlined />
                          <span>{t('breadcrumb.category_level_1')}</span>
                        </Breadcrumb.Item>
                      </Breadcrumb>
                    </Space>
                  </Card>
                </Col>
              </Row>
              <Row className="gus-row-breathe">
                <Col style={{ width: '100%' }}>
                  <Card title={t('scraping_groups.product_text')}>
                    <Space direction="vertical" size="middle">
                      <Tooltip title={t('tooltips.scraping_not_available')} color="orange">
                        <h1>{t('product.label')}</h1>
                      </Tooltip>
                      <Tooltip title={t('tooltips.scraping_not_available')} color="orange">
                        <p>{t('product.description')}</p>
                      </Tooltip>
                    </Space>
                  </Card>
                </Col>
              </Row>
              <Row className="gus-row-breathe">
                <Col style={{ width: '100%' }}>
                  <Card title={t('scraping_groups.ratings')}>
                    <Space direction="horizontal" align="start">
                      <Rate allowHalf defaultValue={2.5} />
                      <Tooltip title={t('tooltips.scraping_not_available')} color="orange">
                        <span>{t('product.ratings_count')}</span>
                      </Tooltip>
                    </Space>
                  </Card>
                </Col>
              </Row>
              <Row className="gus-row-breathe">
                <Col className="gus-col-breathe">
                  <Card
                    title={t('scraping_groups.media')}
                    cover={
                      <Image
                        width={400}
                        height={400}
                        src="error"
                        fallback="data:image/png;base64,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"
                      />
                    }
                  />
                </Col>
                <Col className="gus-col-breathe">
                  <Row className="gus-row-breathe">
                    <Col className="gus-col-breathe">
                      <Space direction="vertical" size="large">
                        <Collapse accordion style={{ width: '30em' }}>
                          <Panel
                            header={
                              <Space direction="horizontal" size="middle">
                                <DollarOutlined />
                                {t('product.price.header')}
                                {validDataCount(DataGroup.PRICE) > 0 ? (
                                  <Badge count={validDataCount(DataGroup.PRICE)} color="magenta" />
                                ) : (
                                  <Badge count={0} color="orange" />
                                )}
                              </Space>
                            }
                            key="1"
                          >
                            <List
                              size="default"
                              dataSource={priceElements}
                              renderItem={(item: IDataConfig) => (
                                <List.Item
                                  key={item.name}
                                  className="gus-scrapable"
                                  onClick={() => {
                                    if (spider?.sampleURLs) {
                                      showSideBar(item);
                                    }
                                  }}
                                >
                                  {isSelectorValid(item.name) ? (
                                    <Space direction="horizontal" size="middle">
                                      <CheckOutlined />{' '}
                                      <Tooltip
                                        title={t('tooltips.data_properly_configured')}
                                        align={{ targetOffset: [-80, 0] }}
                                        placement="right"
                                        color="geekblue"
                                      >
                                        {item.label}
                                      </Tooltip>{' '}
                                    </Space>
                                  ) : (
                                    <Space direction="horizontal" size="middle">
                                      <CloseOutlined />{' '}
                                      <Tooltip
                                        title={t('tooltips.data_improperly_configured')}
                                        align={{ targetOffset: [-80, 0] }}
                                        placement="right"
                                        color="orange"
                                      >
                                        {item.label}
                                      </Tooltip>{' '}
                                    </Space>
                                  )}
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>
                        <Collapse accordion style={{ width: '30em' }}>
                          <Panel
                            header={
                              <Space direction="horizontal" size="middle">
                                <FiPackage />
                                {t('product.delivery.header')}
                              </Space>
                            }
                            key="2"
                          >
                            <List
                              size="default"
                              dataSource={[
                                t('product.delivery.mode'),
                                t('product.delivery.delay'),
                                t('product.delivery.price'),
                                t('product.delivery.currency')
                              ]}
                              renderItem={(item) => (
                                <List.Item className="gus-scraping-element">
                                  <Tooltip
                                    title={t('tooltips.scraping_not_available')}
                                    color="orange"
                                    align={{ targetOffset: [-80, 0] }}
                                    placement="right"
                                  >
                                    {item}
                                  </Tooltip>
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>

                        <Collapse accordion style={{ width: '30em' }}>
                          <Panel
                            header={
                              <Space direction="horizontal" size="middle">
                                <HighlightOutlined />
                                {t('product.attributes.header')}
                              </Space>
                            }
                            key="3"
                          >
                            <List
                              size="default"
                              dataSource={[t('product.attributes.name'), t('product.attributes.value')]}
                              renderItem={(item) => (
                                <List.Item className="gus-scraping-element">
                                  <Tooltip
                                    title={t('tooltips.scraping_not_available')}
                                    color="orange"
                                    align={{ targetOffset: [-80, 0] }}
                                    placement="right"
                                  >
                                    {item}
                                  </Tooltip>
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>

                        <Collapse accordion style={{ width: '30em' }}>
                          <Panel
                            header={
                              <Space direction="horizontal" size="middle">
                                <AmazonOutlined />
                                {t('product.vendor.header')}
                              </Space>
                            }
                            key="3"
                          >
                            <List
                              size="default"
                              dataSource={[
                                t('product.vendor.name'),
                                t('product.vendor.price'),
                                t('product.vendor.delivery_delay'),
                                t('product.vendor.delivery_method'),
                                t('product.vendor.delivery_cost')
                              ]}
                              renderItem={(item) => (
                                <List.Item className="gus-scraping-element">
                                  <Tooltip
                                    title={t('tooltips.scraping_not_available')}
                                    color="orange"
                                    align={{ targetOffset: [-80, 0] }}
                                    placement="right"
                                  >
                                    {item}
                                  </Tooltip>
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>

                        <Collapse accordion style={{ width: '30em' }}>
                          <Panel
                            header={
                              <Space direction="horizontal" size="middle">
                                <SketchOutlined />
                                {t('product.custom_data.header')}
                              </Space>
                            }
                            key="3"
                          >
                            <List
                              size="default"
                              dataSource={[t('product.custom_data.manage_custom_data')]}
                              renderItem={(item) => (
                                <List.Item className="gus-scraping-element">
                                  <Tooltip
                                    title={t('tooltips.scraping_not_available')}
                                    color="orange"
                                    align={{ targetOffset: [-80, 0] }}
                                    placement="right"
                                  >
                                    {item}
                                  </Tooltip>
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Space>
      }
    </>
  );
};

export default ProductSheet;

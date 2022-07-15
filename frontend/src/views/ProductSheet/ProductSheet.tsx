import React, { useState, useContext, useEffect, Fragment, useRef } from 'react';
import { Row, Col, Breadcrumb, Rate, Image, List, Space, Divider, Tooltip, Spin, Collapse } from 'antd';
import { HomeOutlined, FolderOpenOutlined, DollarOutlined } from '@ant-design/icons';
import { FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';
import { Data, Spider } from '../../interfaces/spider';
import { DataConfig } from '../../components/Data/DataConfig';
import { ConfigSidebar } from '../../components/Layout/ConfigSidebar';

import '../../style.css';

const { Panel } = Collapse;

interface IDataConfig {
  name: string;
  label: string;
}

const ProductSheet: React.FC = () => {
  const { t } = useTranslation('product_sheet');

  const spider = useRef<Spider | undefined>(undefined);

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);

  // deactivate user actions
  // while loading the spider config
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // the spider name is fetched from the URL path !
  // it is NOT the data name !
  const { name } = useParams();

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
    if (spider.current) {
      // load the spider data for this element
      let dataIndex = -1;
      spider.current.data?.forEach((d: Data, index: number) => {
        if (d.name === element.name) {
          setData(d);
          dataIndex = index;
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

  const scrapingAvailability = () => {
    if (spider.current?.sampleURLs) {
      return t('page.scraping_available');
    } else {
      return t('page.define_sample_urls');
    }
  };

  const priceElements: Array<IDataConfig> = [
    {
      name: 'price.discount',
      label: t('product.price.discount')
    },
    {
      name: 'price.recommended',
      label: t('product.price.recommended')
    },
    {
      name: 'price.unit',
      label: t('product.price.unit')
    },
    {
      name: 'price.currency',
      label: t('product.price.currency')
    }
  ];

  useEffect(() => {
    if (spider.current?.name !== name && name !== undefined) {
      setIsLoading(true);
      backendProvider.get(name, (_spider: Spider | undefined) => {
        if (_spider) {
          spider.current = _spider;
        } else {
          // TODO
          // notify the user,
          // the spider wasn't found
          // propose to navigate to another screen ?
          // or redirect the user ?
        }
        setIsLoading(false);
      });
    }
  }, [backendProvider, name]);

  return (
    <Fragment>
      {data && spider.current && (
        <ConfigSidebar isVisible={isSideBarOpen} onClose={closeSideBar}>
          <DataConfig data={data} spider={spider.current} />
        </ConfigSidebar>
      )}
      {isLoading && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="horizontal">
            <Spin />
            <span>{t('loading')}</span>
          </Space>
        </Space>
      )}
      {!isLoading && (
        <Space size={['large', 0]} direction="vertical" className="gus-main-content">
          <Row className="gus-main-row">
            <Col>
              <Row>
                <Col>
                  <Breadcrumb className="gus-scraping-element">
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
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="gus-main-row">
            <Col>
              <Row className="gus-row-breathe">
                <Col>
                  <Tooltip title={t('page.scraping_not_available')} color="orange">
                    <h1 className="gus-scraping-element">{t('product.label')}</h1>
                  </Tooltip>
                </Col>
              </Row>
              <Row className="gus-row-breathe">
                <Col>
                  <Space direction="horizontal" align="start">
                    <Rate allowHalf defaultValue={2.5} className="gus-scraping-element" />
                    <Tooltip title={t('page.scraping_not_available')} color="orange">
                      <span className="gus-scraping-element">{t('product.rating')}</span>
                    </Tooltip>
                  </Space>
                </Col>
              </Row>
              <Row className="gus-row-breathe">
                <Col className="gus-col-breathe">
                  <Image
                    className="gus-scraping-element"
                    width={400}
                    height={400}
                    src="error"
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                  ></Image>
                </Col>
                <Col className="gus-col-breathe">
                  <Row className="gus-row-breathe">
                    <Col className="gus-col-breathe">
                      <Collapse accordion style={{ width: '30em' }}>
                        <Panel
                          header={
                            <>
                              <DollarOutlined />
                              {t('product.price.header')}
                            </>
                          }
                          key="1"
                        >
                          <List
                            size="default"
                            dataSource={priceElements}
                            renderItem={(item: IDataConfig) => (
                              <List.Item
                                key={item.name}
                                className="gus-scraping-element"
                                onClick={() => {
                                  if (spider.current?.sampleURLs) {
                                    showSideBar(item);
                                  }
                                }}
                              >
                                <Tooltip title={scrapingAvailability} color="geekblue">
                                  {item.label}
                                </Tooltip>
                              </List.Item>
                            )}
                          />
                        </Panel>
                        <Panel
                          header={
                            <>
                              <FiPackage />
                              {t('product.delivery.header')}
                            </>
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
                                <Tooltip title={t('page.scraping_not_available')} color="orange">
                                  {item}
                                </Tooltip>
                              </List.Item>
                            )}
                          />
                        </Panel>
                      </Collapse>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Space>
      )}
    </Fragment>
  );
};

export default ProductSheet;

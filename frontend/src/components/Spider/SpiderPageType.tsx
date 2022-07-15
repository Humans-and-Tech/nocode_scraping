import React, { useContext, useEffect, useState } from 'react';
import { Space, Card, Divider } from 'antd';

import { CheckCircleOutlined } from '@ant-design/icons';

import { PageType, Spider } from '../../interfaces/spider';
import { useTranslation } from 'react-i18next';
import { SpiderContext } from '../../BackendContext';
import { ISpiderBackend } from '../../BackendProvider';

import '../../style.css';
import './SpiderConfig.scoped.css';

const { Meta } = Card;

interface SpiderPageTyperProps {
  spider: Spider;
  onChange: (spider: Spider) => void;
}

export const SpiderPageType = (props: SpiderPageTyperProps): JSX.Element => {
  const { t } = useTranslation('onboarding');

  const { spider, onChange } = props;

  const backendProvider = useContext<ISpiderBackend>(SpiderContext);

  // const socket = useContext<Socket>(SpiderSocketContext);

  // manage a state on the pageType
  // to refresh the card when changing the spider pageType
  const [pageType, setPageType] = useState<PageType | undefined>(undefined);

  const saveSpider = () => {
    if (spider !== undefined) {
      backendProvider.upsert(spider, (b: boolean) => {
        // TODO notify the user
        if (b) {
          onChange(spider);
        }
      });
    }
  };

  const chooseProductSheet = () => {
    if (spider !== undefined) {
      spider.pageType = PageType.ProductSheet;
      setPageType(PageType.ProductSheet);
      saveSpider();
    }
  };

  const chooseCategoryPage = () => {
    if (spider !== undefined) {
      spider.pageType = PageType.CategoryPage;
      setPageType(PageType.CategoryPage);
      saveSpider();
    }
  };

  useEffect(() => {
    // initialization of the pageType
    if (spider !== undefined) {
      setPageType(spider.pageType);
    }
  }, [spider]);

  return (
    <Space direction="horizontal" split={<Divider type="vertical" style={{ height: '300px' }} />}>
      <Card
        hoverable
        style={{ width: 240, margin: '1em 2em' }}
        cover={<img alt={t('page_type.product_sheet_image')} src="assets/product-sheet.png" />}
        onClick={chooseProductSheet}
        extra={
          pageType == PageType.ProductSheet ? (
            <Space direction="horizontal" align="end" className="card-selected">
              <CheckCircleOutlined />
              {t('page_type.product_sheet_selected')}
            </Space>
          ) : (
            <span className="card-not-selected">{t('page_type.click_to_select_helper')}</span>
          )
        }
      >
        <Meta title={t('page_type.product_sheet')} description={t('page_type.product_sheet_desc')} />
      </Card>

      <Card
        hoverable
        style={{ width: 240, margin: '1em 2em' }}
        cover={<img alt={t('page_type.category_page_image')} src="assets/category-page.png" />}
        onClick={chooseCategoryPage}
        extra={
          pageType == PageType.CategoryPage ? (
            <Space direction="horizontal" align="end" className="card-selected">
              <CheckCircleOutlined />
              {t('page_type.category_page_selected')}
            </Space>
          ) : (
            <span className="card-not-selected">{t('page_type.click_to_select_helper')}</span>
          )
        }
      >
        <Meta title={t('page_type.category_page')} description={t('page_type.category_page_desc')} />
      </Card>
    </Space>
  );
};

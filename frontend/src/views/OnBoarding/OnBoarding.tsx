import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Space,
    Steps,
    Result,
    Button,
    Card,
    Divider,
} from "antd";

import { CheckCircleOutlined } from "@ant-design/icons";
import { Socket } from "socket.io-client";

import { PageType, Spider } from '../../interfaces/spider'
import { useTranslation } from "react-i18next";
import { SocketContext } from "../../socket";
import { ScrapingContext, ISpiderProvider } from '../../ConfigurationContext';
import { SearchSpider } from '../../components/Spider/SearchSpider'


import "../../style.css";
import "./OnBoarding.scoped.css"


const { Step } = Steps;
const { Meta } = Card;


const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const spiderProvider = useContext<ISpiderProvider>(ScrapingContext);

    const socket = useContext<Socket>(SocketContext);

    const navigate = useNavigate();

    const [spiderName, setSpiderName] = useState<string | undefined>(undefined);

    const [currentStep, setCurrentStep] = useState<number>(0);

    const [pageType, setPageType] = useState<PageType | undefined>(undefined);


    /**
     * resets all state elements used in the onboarding
     */
    const reset = () => {
        setCurrentStep(0);
        setPageType(undefined);
        setSpiderName(undefined);
    };


    /**
     * save the spider and go to the next step
     */
    const nextStep = () => {

        if (currentStep == 0) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep == 1) {
            if (pageType == undefined) {
                // TODO: notify of the error
            } else {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep == 2) {
            // do nothing
        }

        saveSpider();
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const saveSpider = () => {
        if (spiderName !== undefined && spiderName !== '') {
            spiderProvider.get(socket, spiderName, (spider: Spider | undefined) => {
                if (spider === null || spider === undefined) {
                    spider = spiderProvider.create(socket, spiderName);
                }
                spider.pageType = pageType;
                spiderProvider.upsert(socket, spider, (b: boolean) => {
                    console.log('upsert successful');
                });
            });
        }
    };

    const chooseProductSheet = () => {
        setPageType(PageType.ProductSheet);
    };

    const chooseCategoryPage = () => {
        setPageType(PageType.CategoryPage);
    };


    const goToScraping = () => {
        if (pageType == PageType.ProductSheet) {
            navigate('/product-sheet');
        } else {
            console.log('stay here for the time being');
        }
    };

    /**
     * the input belongs to the search component
     * thus if no proposal is selected, we must 
     * nevertheless keep the user input !
     * 
     */
    const onSpiderNameChange = (val: string) => {
        console.log('onSpiderNameChange', val);
        setSpiderName(val);
    };

    const editSpider = (spider: Spider) => {
        setSpiderName(spider.name);
        setPageType(spider.pageType);
    };

    return (
        <>
            <Space size="large" direction="vertical" align="center">
                <Steps current={currentStep}>
                    <Step title={t('step.configure')} description={t('step.configure_desc')} />
                    <Step title={t('step.choose_page_type')} description={t('step.choose_page_type_desc')} />
                    <Step title={t('step.finished')} description={t('step.finished_desc')} />
                </Steps>

                {currentStep == 0 &&
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                        <SearchSpider onLoaded={editSpider} onChange={onSpiderNameChange} />

                        <Button type="primary" onClick={nextStep}>
                            {t('action.next_step')}
                        </Button>
                    </Space>
                }

                {currentStep == 1 &&
                    <>
                        <Space direction="horizontal" split={<Divider type="vertical" style={{ 'height': '300px' }} />}>
                            <Card
                                hoverable
                                style={{ width: 240, 'margin': '1em 2em' }}
                                cover={<img alt={t('page_type.product_sheet_image')} src="assets/product-sheet.png" />}
                                onClick={chooseProductSheet}
                                extra={
                                    pageType == PageType.ProductSheet
                                        ? <Space direction="horizontal" align="end" className="card-selected"><CheckCircleOutlined />{t('page_type.product_sheet_selected')}</Space>
                                        : <span className="card-not-selected">{t('page_type.click_to_select_helper')}</span>
                                }
                            >
                                <Meta title={t('page_type.product_sheet')} description={t('page_type.product_sheet_desc')} />
                            </Card>

                            <Card
                                hoverable
                                style={{ width: 240, 'margin': '1em 2em' }}
                                cover={<img alt={t('page_type.category_page_image')} src="assets/category-page.png" />}
                                onClick={chooseCategoryPage}
                                extra={
                                    pageType == PageType.CategoryPage
                                        ? <Space direction="horizontal" align="end" className="card-selected"><CheckCircleOutlined />{t('page_type.category_page_selected')}</Space>
                                        : <span className="card-not-selected">{t('page_type.click_to_select_helper')}</span>
                                }
                            >
                                <Meta title={t('page_type.category_page')} description={t('page_type.category_page_desc')} />
                            </Card>
                        </Space>

                        <Space>
                            <Button type="primary" onClick={previousStep}>
                                {t('action.previous_step')}
                            </Button>
                            <Button type="primary" onClick={nextStep}>
                                {t('action.next_step')}
                            </Button>
                        </Space>

                    </>
                }


                {currentStep == 2 &&
                    <Result
                        status="success"
                        title={t('finished.start_scraping')}
                        subTitle={t('finished.start_scraping_subtitle')}
                        extra={[
                            <Button type="primary" key="start_scraping" onClick={goToScraping}>
                                {t('action.start_scraping_action')}
                            </Button>,
                            <Button key="reset" onClick={reset}>
                                {t('action.reset')}
                            </Button>,
                        ]}
                    />
                }
            </Space>

        </>
    );
};

export default OnBoarding;

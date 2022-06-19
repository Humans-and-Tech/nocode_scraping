import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Space,
    Steps,
    Result,
    Button,
    Card,
    Divider,
    Input,
} from "antd";

import { CheckCircleOutlined } from "@ant-design/icons";
import { Socket } from "socket.io-client";

import { PageType, ScrapingConfig } from '../../interfaces'
import { useTranslation } from "react-i18next";

import { ScrapingContext, ScrapingConfigProvider, createConfig } from '../../ConfigurationContext';
import { SearchSpider } from '../../components/SpiderConfig/SearchSpider'
import { SocketContext } from "../../socket";
import { emit } from '../../socket/events'

import "../../style.css";
import "./OnBoarding.scoped.css"


const { Step } = Steps;
const { Meta } = Card;
const { TextArea } = Input;


const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

    const navigate = useNavigate();

    const [config, setConfig] = useState<ScrapingConfig>(createConfig());

    const [currentStep, setCurrentStep] = useState<number>(0);

    const [proxy, setProxy] = useState<string | undefined>('');

    const [pageType, setPageType] = useState<PageType | undefined>(undefined);

    const socket = useContext<Socket>(SocketContext);

    const reset = () => {
        setCurrentStep(0);
        setProxy('');
        setPageType(undefined);
        setConfig(createConfig());
        configProvider.setConfig(null);
    };

    /**
     * merges the existing config from the local storage
     * with the new config options decided in this onboarding
     * 
     * does not reset the existing config !
     */
    const saveConfig = (config: ScrapingConfig): void => {
        const oldConfig = configProvider.getConfig();

        if (config.pageType !== undefined) {
            oldConfig.pageType = config.pageType;
        }
        if (config.pageUrl !== undefined) {
            oldConfig.pageUrl = config.pageUrl;
        }
        if (config.websiteConfig.name !== undefined) {
            oldConfig.websiteConfig.name = config.websiteConfig.name;
        }
        if (config.websiteConfig.proxy !== undefined) {
            oldConfig.websiteConfig.proxy = config.websiteConfig.proxy;
        }
        configProvider.setConfig(oldConfig);

        // store the config
        emit(socket, "save-config", oldConfig);
    };

    /**
     * check the config validity 
     * and navigate to the next step
     */
    const nextStep = () => {

        if (currentStep == 0) {
            saveConfig(config);
            setCurrentStep(currentStep + 1);
        } else if (currentStep == 1) {
            if (pageType == undefined) {
                // TODO: notify of the error
            } else {
                saveConfig(config);
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep == 2) {
            // do nothing
            saveConfig(config);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const chooseProductSheet = () => {
        setPageType(PageType.ProductSheet);
        config.pageType = PageType.ProductSheet;
        setConfig(config);
    };

    const chooseCategoryPage = () => {
        setPageType(PageType.CategoryPage);
        config.pageType = PageType.CategoryPage;
        setConfig(config);
    };


    const goToScraping = () => {
        console.log('pageType', pageType);
        if (pageType == PageType.ProductSheet) {
            navigate('/product-sheet');
        } else {
            console.log('stay here');
        }
    };


    /**
     * config changed externally, reload it
     */
    const onConfigChange = () => {
        setConfig(configProvider.getConfig());
    };

    const changeProxy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProxy(e.target.value);
        config.websiteConfig.proxy = e.target.value;
        setConfig(config);
    };

    /**
     * pre-fill the config fields
     * but never update them in the useEffect
     * otherwise you'll have weird behaviours
     * prefer to udpate the config directly when changing the input values
     */
    useEffect(() => {
        const config = configProvider.getConfig();
        setProxy(config?.websiteConfig?.proxy);
        setPageType(config?.pageType);
    }, [configProvider]);

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

                        <SearchSpider onLoaded={onConfigChange} />

                        <h2>{t('configure.proxy_title')}</h2>
                        <em>{t('configure.proxy_subtitle')}</em>
                        <TextArea onChange={changeProxy} rows={4} value={proxy} placeholder={t('configure.proxy_placeholder')} />

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

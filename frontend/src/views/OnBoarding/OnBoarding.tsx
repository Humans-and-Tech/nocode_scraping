import React, { useContext, useEffect, useState } from "react";
import {
    Space,
    Steps,
    Result,
    Button,
    Card,
    Divider,
    Input
} from "antd";
import { AiOutlineCheckCircle } from 'react-icons/ai'

import { PageType } from '../../interfaces'
import { useTranslation } from "react-i18next";

import { ScrapingContext, ScrapingConfigProvider } from '../../index'

import "../../style.css";
import "./OnBoarding.scoped.css"

const { Step } = Steps;
const { Meta } = Card;
const { TextArea } = Input;



const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext)

    const [currentStep, setCurrentStep] = useState<number>(0);

    const [name, setName] = useState<string | undefined>('');

    const [nameStatus, setNameStatus] = useState<'' | 'error'>('');

    const [proxy, setProxy] = useState<string | undefined>('');

    const [pageType, setPageType] = useState<PageType | undefined>(undefined);

    const reset = () => {
        setCurrentStep(0);
        setName('');
        setProxy('');
        setPageType(undefined);
        configProvider.setConfig(null);
    };

    /**
     * check the config validity 
     * and navigate to the next step
     */
    const nextStep = () => {

        if (currentStep == 0) {
            if (name == '') {
                setNameStatus('error');
            } else {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep == 1) {
            if (pageType == undefined) {
                // TODO: notify of the error
            } else {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep == 2) {
            // do nothing
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const chooseProductSheet = () => {
        setPageType(PageType.ProductSheet);
    };

    const chooseCategoryPage = () => {
        setPageType(PageType.CategoryPage);
    };

    const changeName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (val == '') {
            setNameStatus('error');
        } else {
            setNameStatus('');
            setName(e.target.value);
        }
        if (name !== undefined) {
            configProvider.setConfig({
                websiteConfig: {
                    name: e.target.value,
                    proxy: proxy
                },
                pageType: pageType
            });
        }
    };

    const changeProxy = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProxy(e.target.value);
        if (name !== undefined) {
            configProvider.setConfig({
                websiteConfig: {
                    name: name,
                    proxy: e.target.value
                },
                pageType: pageType
            });
        }
    };

    /**
     * pre-fill the config fields
     * but never update them in the useEffect
     * otherwise you'll have weird behaviours
     * prefer to udpate the config directly when changing the input values
     */
    useEffect(() => {
        const config = configProvider.getConfig();
        setName(config?.websiteConfig.name);
        setProxy(config?.websiteConfig.proxy);
        setPageType(config?.pageType);
    }, []);

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

                        <h2>{t('configure.name_input_title')}</h2>
                        <em>{t('configure.name_input_subtitle')}</em>
                        <Input status={nameStatus} onChange={changeName} value={name} placeholder={t('configure.name_placeholder')} />
                        {nameStatus == 'error' && <em className="error">{t('configure.name_input_invalid')}</em>}

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
                                        ? <Space direction="horizontal" align="end" className="card-selected"><AiOutlineCheckCircle />{t('page_type.product_sheet_selected')}</Space>
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
                                        ? <Space direction="horizontal" align="end" className="card-selected"><AiOutlineCheckCircle />{t('page_type.category_page_selected')}</Space>
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
                            <Button type="primary" key="start_scraping">
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

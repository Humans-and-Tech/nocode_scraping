import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Space,
    Steps,
    Result,
    Button,
} from "antd";
import { PageType, Spider } from '../../interfaces/spider';
import { useTranslation } from "react-i18next";


import { SpiderSearch } from '../../components/Spider/SpiderSearch';
import { SpiderPageType } from "../../components/Spider/SpiderPageType";

import "../../style.css";
import "./OnBoarding.scoped.css"

const { Step } = Steps;

const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const navigate = useNavigate();

    const [spider, setSpider] = useState<Spider | undefined>(undefined);

    const [currentStep, setCurrentStep] = useState<number>(0);

    /**
     * resets all state elements used in the onboarding
     */
    const reset = () => {
        setCurrentStep(0);
        setSpider(undefined);
    };


    /**
     * save the spider and go to the next step
     */
    const nextStep = () => {

        if (currentStep == 0) {
            setCurrentStep(currentStep + 1);

        } else if (currentStep == 1) {
            if (spider == undefined) {
                // go back to the 1st step
                setCurrentStep(0);
            } else {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep == 2) {

            if (spider == undefined) {
                // this should never occur
                // the user tricked the game
                // send him back to the 1st step
                setCurrentStep(0);
            } else if (spider.pageType == PageType.ProductSheet) {
                navigate(`/spider/${spider.name}/product-sheet`);
            } else {
                console.log('stay here for the time being');
            }
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };


    const onSpiderReceived = (spider: Spider) => {
        setSpider(spider);
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

                        <SpiderSearch onLoaded={onSpiderReceived} />

                        {spider &&
                            <Button type="primary" onClick={nextStep}>
                                {t('action.next_step')}
                            </Button>
                        }
                    </Space>
                }

                {currentStep == 1 && spider &&
                    <>
                        <SpiderPageType spider={spider} onChange={onSpiderReceived} />

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


                {currentStep == 2 && spider &&
                    <Result
                        status="success"
                        title={t('finished.start_scraping')}
                        subTitle={t('finished.start_scraping_subtitle', { name: spider?.name })}
                        extra={[
                            <Button type="primary" key="start_scraping" onClick={nextStep}>
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

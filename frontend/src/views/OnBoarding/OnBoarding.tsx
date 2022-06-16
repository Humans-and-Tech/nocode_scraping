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

import { PageType, WebsiteConfig } from '../../interfaces'
import { useTranslation } from "react-i18next";

import { SocketContext } from "../../socket";

import "../../style.css";

const { Step } = Steps;
const { Meta } = Card;
const { TextArea } = Input;



const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const socket = useContext(SocketContext);

    const [currentStep, setCurrentStep] = useState<number>(0);

    const [pageType, setPageType] = useState<PageType | undefined>(undefined);

    const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | undefined>(undefined);

    const reset = () => {
        // TODO
        // reset the localStorage
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
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


    useEffect(() => {
        // store this config
        // in the localStorage
        // let's define a WebsiteConfigProvider
        // that we'll pass in the context of the next pages
    }, [pageType, websiteConfig]);

    return (
        <>
            <Space size="large" direction="vertical" align="center">
                <Steps current={currentStep}>
                    <Step title={t('step.configure')} description={t('step.configure_desc')} />
                    <Step title={t('step.choose_page_type')} description={t('step.choose_page_type_desc')} />
                    <Step title={t('step.finished')} description={t('step.finished_desc')} />
                </Steps>

                {currentStep == 0 &&
                    <>
                        <Input placeholder={t('configure.website_placeholder')} />
                        <TextArea placeholder={t('configure.proxy_placeholder')} />

                        <Button type="primary" onClick={nextStep}>
                            {t('action.next_step')}
                        </Button>
                    </>
                }

                {currentStep == 1 &&
                    <>
                        <Space split={<Divider type="vertical" style={{ 'height': '300px' }} />}>
                            <Card
                                hoverable
                                style={{ width: 240, 'margin': '1em 2em' }}
                                cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                                onClick={chooseProductSheet}
                            >
                                <Meta title={t('page_type.product_sheet')} description={t('page_type.product_sheet_desc')} />
                            </Card>

                            <Card
                                hoverable
                                style={{ width: 240, 'margin': '1em 2em' }}
                                cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                                onClick={chooseCategoryPage}
                            >
                                <Meta title={t('page_type.category_page')} description={t('page_type.category_page_desc')} />
                            </Card>
                            <Space>
                                <Button type="primary" onClick={previousStep}>
                                    {t('action.previous_step')}
                                </Button>
                                <Button type="primary" onClick={nextStep}>
                                    {t('action.next_step')}
                                </Button>
                            </Space>
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

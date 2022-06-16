import React, { useContext, useState } from "react";
import {
    Space,
    Steps,
    Result,
    Button,
    Card,
    Divider,
    Input
} from "antd";


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

    return (
        <>
            <Space size="large" direction="vertical" align="center">
                <Steps current={currentStep}>
                    <Step title={t('step.configure')} description={t('step.configure_desc')} />
                    <Step title={t('step.choose_page_type')} description={t('step.choose_page_type_desc')} />
                    <Step title={t('step.finished')} description={t('step.finished_desc')} />
                </Steps>

                <Input placeholder={t('configure.website_placeholder')} />
                <TextArea placeholder={t('configure.proxy_placeholder')} />

                <Space split={<Divider type="vertical" style={{ 'height': '300px' }} />}>
                    <Card
                        hoverable
                        style={{ width: 240, 'margin': '1em 2em' }}
                        cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                    >
                        <Meta title={t('page_type.product_sheet')} description={t('page_type.product_sheet_desc')} />
                    </Card>

                    <Card
                        hoverable
                        style={{ width: 240, 'margin': '1em 2em' }}
                        cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                    >
                        <Meta title={t('page_type.category_page')} description={t('page_type.category_page_desc')} />
                    </Card>

                </Space>

                <Result
                    status="success"
                    title={t('finished.start_scraping')}
                    subTitle={t('finished.start_scraping_subtitle')}
                    extra={[
                        <Button type="primary" key="console">
                            {t('finished.start_scraping_action')}
                        </Button>,
                    ]}
                />

            </Space>

        </>
    );
};

export default OnBoarding;

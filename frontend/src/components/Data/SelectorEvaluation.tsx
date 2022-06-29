import React from "react";
import { Space, Image } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { ScrapingResponse, ScrapingStatus } from "../../interfaces/events";


import './Data.scoped.css';

interface ISelectorEvalPropsType {
    evaluation: ScrapingResponse | undefined;
}


export const SelectorEvaluation = (props: ISelectorEvalPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { evaluation } = props;


    return (
        <>
            {evaluation && evaluation !== null && evaluation.status == ScrapingStatus.SUCCESS && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CheckCircleOutlined className="success"></CheckCircleOutlined>
                        <span>{t("field.evaluation.result", { value: evaluation.content })}</span>
                    </Space>
                    {
                        evaluation.screenshot !== undefined && evaluation.screenshot != '' &&
                        <>
                            <h4>{t('field.evaluation.screenshot')}</h4>
                            <Image
                                width={200}
                                src={evaluation.screenshot}
                                data-testid="screenshot"
                            ></Image>

                        </>
                    }
                </Space>
            )}
            {evaluation && evaluation !== null && evaluation.status == ScrapingStatus.NO_POPUP && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        {
                            evaluation.selector !== undefined
                                ? <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.no_popup', { selector: evaluation.selector.path }) }}></span>
                                : <span>{t("field.evaluation.failure_unknown", { message: evaluation.message })}</span>
                        }

                    </Space>
                </Space>
            )}
            {evaluation && evaluation !== null && evaluation.status == ScrapingStatus.ERROR && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        {
                            evaluation.selector !== undefined
                                ? <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.failure', { selector: evaluation.selector.path }) }}></span>
                                : <span>{t("field.evaluation.failure_unknown", { message: evaluation.message })}</span>
                        }

                    </Space>
                </Space>
            )}
            {evaluation && evaluation !== null && evaluation.status == ScrapingStatus.NO_POPUP && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        {
                            evaluation.selector !== undefined
                                ? <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.no_popup', { selector: evaluation.selector.path }) }}></span>
                                : <span>{t("field.evaluation.failure_unknown", { message: evaluation.message })}</span>
                        }

                    </Space>
                </Space>
            )}
        </>

    );
};



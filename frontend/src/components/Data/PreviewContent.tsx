import React from "react";
import { Space, Image } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { ScrapingResponse, ScrapingStatus } from "../../interfaces/events";


import './Data.scoped.css';

interface ISelectorEvalPropsType {
    content: ScrapingResponse | undefined;
}


export const PreviewContent = (props: ISelectorEvalPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { content } = props;


    return (
        <>
            {content && content.status == ScrapingStatus.SUCCESS && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CheckCircleOutlined className="success"></CheckCircleOutlined>
                        <span>{t("field.evaluation.result", { value: content.content })}</span>
                    </Space>
                    {
                        content.screenshot !== undefined && content.screenshot != '' &&
                        <>
                            <h4>{t('field.evaluation.screenshot')}</h4>
                            <Image
                                width={200}
                                src={content.screenshot}
                                data-testid="screenshot"
                            ></Image>

                        </>
                    }
                </Space>
            )}
            {content && content.status == ScrapingStatus.NO_CONTENT && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.no_content', { selector: content.selector.path }) }}></span>
                    </Space>
                </Space>
            )}
            {content && content.status == ScrapingStatus.ELEMENT_NOT_FOUND && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        {
                            content.selector !== undefined
                                ? <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.no_popup', { selector: content.selector.path }) }}></span>
                                : <span>{t("field.evaluation.failure_unknown", { message: content.message })}</span>
                        }

                    </Space>
                </Space>
            )}
            {content && content.status == ScrapingStatus.ERROR && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        {
                            content.selector !== undefined
                                ? <span dangerouslySetInnerHTML={{ __html: t('field.evaluation.failure', { selector: content.selector.path }) }}></span>
                                : <span>{t("field.evaluation.failure_unknown", { message: content.message })}</span>
                        }

                    </Space>
                </Space>
            )}
        </>

    );
};



import React, { useState, useContext, useEffect } from "react";
import { Input, Button, Space, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { evaluate, validateCssSelector } from '../../socket/events';
import { Selector } from "../../interfaces";


import './Scraping.scoped.css';

const { TextArea } = Input;


const createSelector = (): Selector => {
    return {
        element: {
            name: undefined
        }
    }
};


interface CSSSelectorPropsType {
    selector: Selector | undefined;
    onPathConfigured: (selector: Selector) => void;

    // the default page Url if none is passed in the selector
    // this is a fallback for the selector
    pageUrl?: string | undefined;
}


export const CSSSelector = (props: CSSSelectorPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { selector, onPathConfigured, pageUrl } = props;

    const [path, setPath] = useState<string>('');
    const [newSelector, setNewSelector] = useState<Selector | undefined>(selector);

    /**
     * the result of the CSS Selector evaluation on the URL (evalUrl)
     * scraped by the backend
     */
    const [evaluation, setEvaluation] = useState<string | null>(null);

    const [evaluationStatus, setEvaluationStatus] = useState<'error' | 'success' | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * action buttons enabled or not
     */
    const [evaluationEnabled, setEvaluationEnabled] = useState<boolean>(false);
    const [checkEnabled, setCheckEnabled] = useState<boolean>(false);

    const [isSelectorPathValid, setIsSelectorPathValid] = useState<boolean | undefined>(undefined);

    const socket = useContext<Socket>(SocketContext);

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const val = e.target.value;
        setPath(val);
        if (val !== undefined && val !== '') {
            setCheckEnabled(true);
        }

        const p = newSelector;
        if (p?.url !== undefined && p.url !== '') {
            console.log('enabling evaluation');
            setEvaluationEnabled(true);
        }
    };


    const onBlur = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        let p = newSelector;
        if (p === undefined) {
            p = createSelector();
        }
        p.path = path;
        if (p?.path !== undefined && p.path !== '') {
            setCheckEnabled(true);
        }

        if (p?.url !== undefined && p.url !== '') {
            console.log('enabling evaluation');
            setEvaluationEnabled(true);
        }
        setNewSelector(p);
    };


    const checkSelectorValidity = (event: React.MouseEvent<HTMLButtonElement>): void => {

        if (newSelector !== undefined) {
            setIsLoading(true);
            validateCssSelector(socket, newSelector, (isValid: boolean) => {
                setIsLoading(false);
                if (isValid) {
                    setIsSelectorPathValid(true);

                    // control for TS Compilation
                    if (newSelector !== undefined) {
                        onPathConfigured(newSelector);
                    }
                } else {
                    console.log('notify the user, selector is not valid');
                    setIsSelectorPathValid(false);
                }
            });
        }
    };


    const evaluateSelectorPath = (
        event: React.MouseEvent<HTMLButtonElement>
    ): void => {

        event.preventDefault();
        setIsLoading(true);
        const s = newSelector;

        if (s !== undefined) {
            evaluate(socket, s, (content: string | null) => {
                if (content === null) {
                    // notify the user
                    setEvaluationStatus('error');
                } else {
                    setEvaluation(content);
                    setEvaluationStatus('success');
                }
                setIsLoading(false);
            })
        }
    };

    /**
     * create a selector if undefined
     * and fallback the selector url to the pageUrl
     * of the config
     */
    useEffect(() => {

        console.log('path:', selector?.path);
        console.log('url:', selector?.url);

        if (selector === undefined) {
            const s = createSelector();
            s.url = pageUrl;
            setNewSelector(s);
        } else {
            selector.url = pageUrl;
            setNewSelector(selector);
        }

        // make the test on selector
        // not on newSelector because
        // it might not be updated yet
        if (selector?.url !== undefined && selector?.url !== '' && selector?.path !== undefined && selector?.path !== '') {
            setEvaluationEnabled(true);
        }

        if (selector?.path !== undefined && selector?.path !== '') {
            setCheckEnabled(true);
        }

    }, [selector, pageUrl, path]);

    return (

        <Space direction="vertical" size="middle">

            {(newSelector?.path == undefined || newSelector?.path == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span>{t('field.evaluation.no_selector_path')}</span>
                </Space>
            }
            {(newSelector?.url == undefined || newSelector?.url == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span>{t('field.evaluation.no_url')}</span>
                </Space>
            }
            <TextArea
                rows={4}
                placeholder={t("field.selector.input_placeholder")}
                onBlur={onBlur}
                onChange={onChange}
                value={path}
            />

            {
                <Space direction="vertical" size="middle">
                    <Space direction="horizontal" size="middle">
                        <Button onClick={evaluateSelectorPath} disabled={!evaluationEnabled}>
                            {t("field.action.evaluate_selector")}
                        </Button>
                        <Button onClick={checkSelectorValidity} disabled={!checkEnabled}>
                            {t("field.action.check_selector_validity")}
                        </Button>
                    </Space>
                </Space>
            }

            {
                isSelectorPathValid &&
                <Space direction="horizontal">
                    <CheckCircleOutlined className="success" />
                    <span>{t("field.css.valid")}</span>
                </Space>
            }

            {
                isSelectorPathValid !== undefined && !isSelectorPathValid &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error" />
                    <span>{t("field.css.invalid")}</span>
                </Space>
            }

            {
                isLoading && <Space direction="horizontal"><Spin /><span>{t('loading')}</span></Space>
            }


            {evaluation && (
                <Space direction="horizontal">
                    <CheckCircleOutlined className="success"></CheckCircleOutlined>
                    <span>{t("field.evaluation.result", { value: evaluation })}</span>
                </Space>
            )}

            {evaluationStatus == 'error' && (
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span>{t("field.evaluation.failure")}</span>
                </Space>
            )}

        </Space>

    );
};



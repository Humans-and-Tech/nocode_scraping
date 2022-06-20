import React, { useState, useContext, useEffect } from "react";
import { Input, Button, Space, Spin, Image, Switch } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { evaluate, validateCssSelector } from '../../socket/events';
import { ScrapingResponse, Selector } from "../../interfaces";


import './Scraping.scoped.css';

const { TextArea } = Input;

const createSelector = (): Selector => {
    return {
        element: {
            name: undefined
        }
    }
};


interface ICSSSelectorPropsType {
    selector: Selector | undefined;
    onConfigured: (selector: Selector) => void;
    onError: () => void;

    // the default page Url if none is passed in the selector
    // this is a fallback for the selector
    pageUrl?: string | undefined;
}


/**
 * this component provides features to validate a CSS path 
 * and to evaluate a CSS selector. When the evaluation is successful, 
 * onConfigured callback is called
 * 
 * The validation can be bypassed, in such a case the CSS path
 * is considered as valid and the onConfigured callback is called
 * 
 * When the evaluation fails, and the user does not bypass the evaluation
 * the onError is called
 * 
 * 
 * @param props ICSSSelectorPropsType
 * @returns JSX.Element
 */
export const CSSSelector = (props: ICSSSelectorPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { selector, onConfigured, onError, pageUrl } = props;

    const [path, setPath] = useState<string>('');

    /**
     * the newSelector changes state,
     * It is initialized with the selector prop passed by the user
     * it will be sent back by the component when calling the onConfigured prop
     * 
     * All evaluations that required the selector should use this newSelector state
     * not the selector prop !
     * 
     */
    const [newSelector, setNewSelector] = useState<Selector | undefined>(undefined);

    /**
     * sometimes, for whatever reason, the evaluation fails
     * but the user is sure of the validity of the selector
     * 
     * we offer a feature which enables to bypass the evaluation
     */
    const [isByPassEvaluation, setIsByPassEvaluation] = useState<boolean>(false);

    /**
     * the result of the CSS Selector evaluation on the URL (evalUrl)
     * scraped by the backend
     */
    const [evaluation, setEvaluation] = useState<ScrapingResponse | undefined>(undefined);

    const [evaluationStatus, setEvaluationStatus] = useState<'error' | 'success' | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSelectorPathValid, setIsSelectorPathValid] = useState<boolean | undefined>(undefined);

    /**
     * action buttons enabled or not
     */
    const [isEvaluationEnabled, setIsEvaluationEnabled] = useState<boolean>(false);
    const [isCheckEnabled, setIsCheckEnabled] = useState<boolean>(false);

    /**
     * the socket to the backend services
     */
    const socket = useContext<Socket>(SocketContext);

    /**
     * triggered when the CSS selector input changes value
     * 
     * @param e : an input event
     */
    const onSelectorChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const val = e.target.value;
        setPath(val);
        if (val !== undefined && val !== '') {
            setIsCheckEnabled(true);
        }

        const p = newSelector;
        if (p?.url !== undefined && p.url !== '') {
            setIsEvaluationEnabled(true);
        }
    };


    /**
     * triggered when the CSS selector input is blurred
     * (looses focus)
     * 
     * @param e an input event
     */
    const onSelectorBlur = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        let p = newSelector;
        if (p === undefined) {
            p = createSelector();
        }
        p.path = path;
        if (p?.path !== undefined && p.path !== '') {
            setIsCheckEnabled(true);
        }

        if (p?.url !== undefined && p.url !== '') {
            console.log('enabling evaluation');
            setIsEvaluationEnabled(true);
        }
        setNewSelector(p);
    };


    /**
     * calls the backend to validate that the CSS selector
     * is valid 
     * 
     * @param event a mouse click
     */
    const checkSelectorValidity = (event: React.MouseEvent<HTMLButtonElement>): void => {

        if (newSelector !== undefined) {
            setIsLoading(true);
            validateCssSelector(socket, newSelector, (isValid: boolean) => {
                setIsLoading(false);
                if (isValid) {
                    setIsSelectorPathValid(true);
                } else {
                    console.log('notify the user, selector is not valid');
                    setIsSelectorPathValid(false);
                }
            });
        }
    };


    /**
     * evaluates the CSS selector path
     * 
     * @param event 
     */
    const evaluateSelectorPath = (
        event: React.MouseEvent<HTMLButtonElement>
    ): void => {

        event.preventDefault();

        setIsLoading(true);

        // reset the evaluation status !
        setEvaluationStatus(undefined);

        const s = newSelector;

        if (s !== undefined) {
            evaluate(socket, s, (response: ScrapingResponse) => {
                console.log('evaluate', response);
                setEvaluation(response);
                if (response.content === null || response.content === undefined) {
                    setEvaluationStatus('error');
                } else {
                    setEvaluationStatus('success');
                }
                setIsLoading(false);
            })
        }
    };


    /**
     * triggered when the user clicks on the select switch
     * 
     * @param checked a boolean
     */
    const byPassEvaluation = (checked: boolean): void => {
        setIsByPassEvaluation(checked);
    };

    /**
     * initializes "newSelector" state if undefined
     * and populates it with the pageUrl passed as a prop
     * 
     * sets the booleans isEvaluationEnabled and isCheckEnabled to true
     * when the url passed in the props is not blank and when
     * the path state coming from the user input is not blank
     * 
     * finally, calls back the onError and onConfigured
     * when everything is fine from this component standpoint
     * (user forces the bypass, or selector is really validated by the component)
     * 
     * calls back the onConfigured
     * when the evaluation is successful
     */
    useEffect(() => {

        // when mounting the component initially
        if (newSelector === undefined) {

            if (selector === undefined) {
                const s = createSelector();
                s.url = pageUrl;
                setNewSelector(s);
            } else if (selector !== undefined) {
                selector.url = pageUrl;
                setNewSelector(selector);
            }
        }

        // reset the pageUrl 
        // it may change between 2 openings of the drawer
        if (newSelector !== undefined) {
            newSelector.url = pageUrl;
        }

        // update the button states
        if (newSelector?.url !== undefined && newSelector?.url !== '' && newSelector?.path !== undefined && newSelector?.path !== '') {
            setIsEvaluationEnabled(true);
        }

        if (newSelector?.path !== undefined && newSelector?.path !== '') {
            setIsCheckEnabled(true);
        }

        // callback when evaluation is not undefined 
        // meaning, when an evaluation has been done
        if (newSelector !== undefined) {

            if (evaluationStatus == 'success') {
                onConfigured(newSelector);
            } else if (evaluationStatus == 'error') {
                onError();
            } else if (isByPassEvaluation) {
                onConfigured(newSelector);
            }
        }


    }, [newSelector, pageUrl, path, evaluationStatus, isByPassEvaluation]);

    return (

        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            {(newSelector?.path == undefined || newSelector?.path == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_selector_path">{t('field.evaluation.no_selector_path')}</span>
                </Space>
            }
            {(newSelector?.url == undefined || newSelector?.url == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_url">{t('field.evaluation.no_url')}</span>
                </Space>
            }
            <TextArea
                rows={4}
                placeholder={t("field.selector.input_placeholder")}
                onBlur={onSelectorBlur}
                onChange={onSelectorChange}
                value={path}
                // we need this for testing purposes
                data-testid="selectorPathInput"
                data-selector-element-name={newSelector?.element.name}
                data-selector-path={newSelector?.path}
                data-selector-url={newSelector?.url}
            />

            {
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal" size="middle">

                        <Button onClick={evaluateSelectorPath} disabled={!isEvaluationEnabled} data-testid="evaluate_btn" >
                            <span data-testid="evaluate_selector" >{t("field.action.evaluate_selector")}</span>
                        </Button>
                        <Button onClick={checkSelectorValidity} disabled={!isCheckEnabled} data-testid="check_validity_btn" >
                            <span data-testid="check_validity" >{t("field.action.check_selector_validity")}</span>
                        </Button>
                    </Space>
                </Space>
            }

            {
                isSelectorPathValid &&
                <Space direction="horizontal">
                    <CheckCircleOutlined className="success" />
                    <span data-testid="css_path_valid" >{t("field.css.valid")}</span>
                </Space>
            }

            {
                isSelectorPathValid !== undefined && !isSelectorPathValid &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error" />
                    <span data-testid="css_path_invalid" >{t("field.css.invalid")}</span>
                </Space>
            }

            {
                isLoading &&
                <Space direction="vertical" size="large" style={{ 'width': '100%' }}>
                    <Space direction="horizontal"><Spin /><span>{t('loading')}</span></Space>
                    {
                        newSelector !== null && newSelector?.url &&
                        <Space direction="vertical" size="small">
                            <span style={{ 'display': 'inline-block' }}>
                                {t('field.evaluation.evaluating_on')}
                            </span>
                            <span style={{ 'display': 'inline-block' }}>
                                <a href={newSelector.url} title={t('field.evaluation.link_title')} target="_blank" rel="noreferrer">
                                    {newSelector.url}
                                </a>
                            </span>
                        </Space>
                    }
                </Space>
            }

            {
                evaluationStatus !== 'success' && path !== undefined && path !== '' &&
                <Space direction="horizontal" size="middle">
                    <Switch onChange={byPassEvaluation} checked={isByPassEvaluation} data-testid="bypass_evaluation_switch" /><h4>{t('field.evaluation.bypass_evaluation')}</h4>
                </Space>
            }

            {evaluation && evaluation !== null && evaluationStatus == 'success' && !isByPassEvaluation && (
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
                                width={'100%'}
                                height={150}
                                style={{ 'objectFit': 'cover', 'objectPosition': 'center top' }}
                                src={evaluation.screenshot}></Image>
                        </>
                    }
                </Space>
            )}

            {evaluation && evaluation !== null && evaluationStatus == 'error' && !isByPassEvaluation && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span>{t("field.evaluation.failure", { value: evaluation.content })}</span>
                    </Space>
                </Space>
            )}

        </Space>

    );
};



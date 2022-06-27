import React, { useState, useContext, useEffect } from "react";
import { Input, Button, Space, Spin, Image, Switch } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from '../../socket';
import { evaluate, validateCssSelector } from '../../socket/data';
import { Data, DataSelector } from "../../interfaces/spider";
import { ScrapingResponse, ScrapingStatus } from "../../interfaces/events";


import './Data.scoped.css';


const { TextArea } = Input;


const createSelector = (): DataSelector => {
    return {
        path: undefined
    }
};

interface IDataSelectorConfigPropsType {
    data: Data;
    onConfigured: (data: Data) => void;
    onError: () => void;

    // sample of pages to test / validate the selector
    sampleUrl?: URL | undefined;
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
 * @param props IDataSelectorPropsType
 * @returns JSX.Element
 */
export const DataSelectorConfig = (props: IDataSelectorConfigPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const socket = useContext<Socket>(SocketContext);

    const { data, onConfigured, onError, sampleUrl } = props;

    // TODO:
    // select the language(CSS, Xpath, jsonld, js)

    /**
     * the textare input path
     * which will populate the selector object 
     */
    const [path, setPath] = useState<string>('');

    /**
     * optionnally, the user may want to configure
     * a CSS selector to click on a cookie pop-up and eliminate it
     * 
     * the cookie pop-up is just used to evaluate the selector 
     */
    const [isCookiePopupPath, setIsCookiePopupPath] = useState<boolean>(false);
    const [cookiePopupPath, setCookiePopupPath] = useState<string>('');

    /**
     * the newSelector changes state,
     * It is initialized with the selector prop passed by the user
     * it will be sent back by the component when calling the onConfigured prop
     * 
     * All evaluations that required the selector should use this newSelector state
     * not the selector prop !
     * 
     */
    // const [newSelector, setNewSelector] = useState<DataSelector | undefined>(undefined);

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

    /**
     * the evaluationStatus reports the fact that the selector "works" or not
     */
    const [evaluationStatus, setEvaluationStatus] = useState<'error' | 'success' | undefined>(undefined);

    /**
     * sometimes shit happen on the backend side
     * we should be able to catch errors from the backend
     * and do something with it
     */
    const [isBackendError, setIsBackendError] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSelectorPathValid, setIsSelectorPathValid] = useState<boolean | undefined>(undefined);

    /**
     * action buttons enabled or not
     */
    const [isEvaluationEnabled, setIsEvaluationEnabled] = useState<boolean>(false);
    const [isCheckEnabled, setIsCheckEnabled] = useState<boolean>(false);

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

        if (sampleUrl !== undefined && sampleUrl.toString() !== '') {
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
        // e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        if (path !== undefined && path !== '') {
            setIsCheckEnabled(true);
        }

        if (sampleUrl !== undefined && sampleUrl.toString() !== '') {
            setIsEvaluationEnabled(true);
        }

        // should never occur but for TS compilation...
        if (data.selector === undefined) {
            data.selector = createSelector();
        }
        data.selector.path = path;
    };


    /**
     * calls the backend to validate that the CSS selector
     * is valid 
     * 
     * @param event a mouse click
     */
    const checkSelectorValidity = (
        // event: React.MouseEvent<HTMLButtonElement>
    ): void => {

        if (data.selector !== undefined) {
            setIsLoading(true);
            validateCssSelector(socket, {}, data.selector, (isValid: boolean) => {
                setIsLoading(false);
                if (isValid) {
                    setIsSelectorPathValid(true);
                } else {
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

        // reset backend error
        setIsBackendError(false);

        // reset evaluation
        setEvaluation(undefined);

        if (data.selector?.path !== undefined && data.selector?.path !== '' && sampleUrl !== undefined && sampleUrl.toString() !== '') {
            // for testing purpose
            // re-assign the path which might not be up-to-date
            // when calling the evaluateSelectorPath after calling the onChange
            // because onChange calls setPath --> path might not be up-to-date
            data.selector.path = path

            // don't pass the cookiePopupPath if the switch button is not activated
            const _cookiePpp = (isCookiePopupPath ? cookiePopupPath : '');

            evaluate(socket, {}, data.selector, sampleUrl, _cookiePpp, (response: ScrapingResponse) => {

                // check the response status
                if (response.status == ScrapingStatus.SUCCESS) {

                    setEvaluation(response);

                    setEvaluationStatus('success');
                    // send the configuration to the parent
                    onConfigured(data);

                } else if (response.status == ScrapingStatus.NO_CONTENT) {

                    setEvaluation(response);

                    // this is a functional error
                    // meaning that the selector returns nothing
                    setEvaluationStatus('error');
                    // notify the parent
                    onError();

                } else {
                    // there has been a technical error
                    // on the backend side
                    // notify the user by a special message
                    setIsBackendError(true);
                }

                setIsLoading(false);
            })
        }
    };


    const switchCookiePopupSelector = (): void => {
        setIsCookiePopupPath(true);
    };

    const onCookiePopupChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setCookiePopupPath(e.target.value);
    };

    const onCookiePopupBlur = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setCookiePopupPath(e.target.value);
    };


    /**
     * triggered when the user clicks on the select switch
     * 
     * @param checked a boolean
     */
    const byPassEvaluation = (checked: boolean): void => {
        setIsByPassEvaluation(checked);

        // send the configuration to the parent
        onConfigured(data);
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
        if (data.selector === undefined) {
            data.selector = createSelector();
        }

        // update the button states
        if (sampleUrl !== undefined && sampleUrl.toString() !== '' && data.selector?.path !== undefined && data.selector?.path !== '') {
            setIsEvaluationEnabled(true);
        }

        if (data.selector?.path !== undefined && data.selector?.path !== '') {
            setIsCheckEnabled(true);
        }

    }, [data, sampleUrl]);

    return (

        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            {(data.selector?.path == undefined || data.selector?.path == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_selector_path">{t('field.evaluation.no_selector_path')}</span>
                </Space>
            }
            {(sampleUrl == undefined || sampleUrl.toString() == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_url">{t('field.evaluation.no_url')}</span>
                </Space>
            }
            <span>{t('field.selector.intro')}</span>
            <TextArea
                rows={4}
                placeholder={t("field.selector.input_placeholder")}
                onBlur={onSelectorBlur}
                onChange={onSelectorChange}
                value={path}
                data-testid="selectorPathInput"
                data-name={data?.name}
                data-selector-path={data.selector?.path || ''}
            />

            {
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal" size="middle">
                        <Switch onChange={setIsCookiePopupPath} checked={isCookiePopupPath} />
                        <h4><a id="switch-cookie-selector">{t('field.evaluation.set_cookie_popup_path')}</a></h4>
                    </Space>
                    {isCookiePopupPath &&
                        <>
                            <span>{t('field.evaluation.cookie_popup_path_intro')}</span>
                            <TextArea
                                rows={4}
                                placeholder={t("field.evaluation.input_cookie_popup_placeholder")}
                                value={cookiePopupPath}
                                onBlur={onCookiePopupBlur}
                                onChange={onCookiePopupChange}
                            />
                        </>
                    }
                </Space>
            }

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
                        data.selector !== null && sampleUrl &&
                        <Space direction="vertical" size="small">
                            <span style={{ 'display': 'inline-block' }}>
                                {t('field.evaluation.evaluating_on')}
                            </span>
                            <span style={{ 'display': 'inline-block' }}>
                                <a href={sampleUrl.toString()} title={t('field.evaluation.link_title')} target="_blank" rel="noreferrer">
                                    {sampleUrl.toString()}
                                </a>
                            </span>
                        </Space>
                    }
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
                                width={200}
                                src={evaluation.screenshot}
                                data-testid="screenshot"
                            ></Image>
                            <Space direction="horizontal">
                                <QuestionCircleOutlined />
                                <span>{t('field.evaluation.screenshot_helper')}</span>
                                <a onClick={switchCookiePopupSelector} href="#switch-cookie-selector" title={t('field.evaluation.screenshot_helper_link_to_cookie_selector')}>
                                    {t('field.evaluation.screenshot_helper_link_to_cookie_selector')}
                                </a>
                            </Space>
                        </>
                    }
                </Space>
            )}

            {evaluation && evaluation !== null && evaluationStatus == 'error' && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span>{t("field.evaluation.failure", { value: evaluation.content })}</span>
                    </Space>
                </Space>
            )}

            {isBackendError && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span>{t("field.evaluation.backend_error")}</span>
                    </Space>
                </Space>
            )}

            {
                evaluationStatus !== 'success' && path !== undefined && path !== '' &&
                <Space direction="horizontal" size="middle">
                    <Switch onChange={byPassEvaluation} checked={isByPassEvaluation} data-testid="bypass_evaluation_switch" />
                    <h4>{t('field.evaluation.bypass_evaluation')}</h4>
                </Space>
            }


        </Space>

    );
};



import React, { useState, useContext, useEffect } from "react";
import { Space, Spin, Switch, Button, Tooltip } from "antd";
import { CloseCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";
import isURL from "validator/lib/isURL";

import { SocketContext } from '../../socket';
import { getContent } from '../../socket/scraping';
import { Data, DataSelector, SelectorStatus } from "../../interfaces/spider";
import { ScrapingError, ScrapingResponse, ScrapingStatus } from "../../interfaces/events";
import { SelectorInput } from './SelectorInput'
import { PreviewContent } from "./PreviewContent";

import './Data.scoped.css';


const createSelector = (): DataSelector => {
    return {
        path: undefined
    }
};

interface ISelectorConfigPropsType {
    data: Data;
    onConfigured: (data: Data) => void;
    onError: () => void;
    onChange: (d: Data) => void;

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
export const SelectorConfig = (props: ISelectorConfigPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const socket = useContext<Socket>(SocketContext);

    const { data, onConfigured, onError, sampleUrl, onChange } = props;

    const [selector, setSelector] = useState<DataSelector | undefined>(undefined);

    /**
     * optionnally, the user may want to configure
     * a CSS selector to click on a cookie pop-up and eliminate it
     * 
     * the cookie pop-up is just used to evaluate the selector 
     */
    const [isPopup, setIsPopup] = useState<boolean>(false);
    const [popupSelector, setPopupSelector] = useState<DataSelector | undefined>(undefined);

    /**
     * the result of the CSS Selector evaluation on the URL (evalUrl)
     * scraped by the backend
     */
    const [evaluation, setEvaluation] = useState<ScrapingResponse | undefined>(undefined);
    const [evaluationHelperMessage, setEvaluationHelperMessage] = useState<string>('');

    /**
     * sometimes shit happen on the backend side
     * we should be able to catch errors from the backend
     * and do something with it
     */
    const [isBackendError, setIsBackendError] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * action buttons enabled or not
     */
    const [isEvaluationEnabled, setIsEvaluationEnabled] = useState<boolean>(false);

    const toggleEvaluation = (s: DataSelector) => {
        if (s.status === SelectorStatus.VALID && sampleUrl !== undefined && isURL(sampleUrl.toString())) {
            setIsEvaluationEnabled(true);
            setEvaluationHelperMessage(t('field.evaluation.enabled'));
        } else {
            setIsEvaluationEnabled(false);
            setEvaluationHelperMessage(t(`field.evaluation.disabled`, { value: s.path }));
        }
    };


    const onDataSelectorChange = (s: DataSelector) => {
        setSelector(s);
        toggleEvaluation(s);

        data.selector = s;
        onChange(data)
    };

    const onPopupSelectorChange = (s: DataSelector) => {
        setPopupSelector(s);
        toggleEvaluation(s);

        data.selector = s;
        onChange(data)
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
        // setEvaluationStatus(undefined);

        // reset backend error
        setIsBackendError(false);

        // reset evaluation
        setEvaluation(undefined);

        if (selector?.path !== undefined && selector?.path !== '' && sampleUrl !== undefined && sampleUrl.toString() !== '') {
            // for testing purpose
            // re-assign the path which might not be up-to-date
            // when calling the evaluateSelectorPath after calling the onChange
            // because onChange calls setPath --> path might not be up-to-date
            // data.selector.path = path

            // don't pass the cookiePopupPath if the switch button is not activated
            const _cookiePpSelector = (isPopup ? popupSelector : undefined);

            getContent(socket, {}, selector, sampleUrl, _cookiePpSelector, (response: ScrapingResponse | undefined, error: ScrapingError | undefined) => {

                setEvaluation(response);

                // check the response status
                if (response && response.status == ScrapingStatus.SUCCESS) {

                    // send the configuration to the parent
                    data.selector = selector;
                    onConfigured(data);

                } else if (response && response.status == ScrapingStatus.ELEMENT_NOT_FOUND) {

                    // message to the user
                    onError();

                } else if (response && response.status == ScrapingStatus.NO_CONTENT) {
                    // message to the user
                    onError();

                } else {
                    // there has been a technical error
                    // on the backend side
                    // notify the user by a special message
                    console.log(error)
                    setIsBackendError(true);
                }

                setIsLoading(false);
            })
        }
    };


    const switchCookiePopupSelector = (): void => {
        setIsPopup(!isPopup);
    };


    /**
     * Loads the selector with the data selector if existing
     * otherwise creates a blank selector object
     * 
     * Initializes as well a popup selector 
     *
     */
    useEffect(() => {
        console.log('loading selector config for ', selector)

        if (data.selector) {
            setSelector(data.selector);
        } else {
            setSelector(createSelector());
        }

        if (popupSelector === undefined) {
            setPopupSelector(createSelector());
        }

        // update the button states
        if (sampleUrl !== undefined && selector?.path !== undefined) {
            setIsEvaluationEnabled(true);
        }

    }, [sampleUrl, data]);

    return (

        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            {(sampleUrl == undefined || sampleUrl.toString() == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_url">{t('field.evaluation.no_url')}</span>
                </Space>
            }
            {
                selector &&
                <>
                    <span>{t('field.selector.intro')}</span>
                    <SelectorInput selector={selector} onChange={onDataSelectorChange} />
                </>
            }
            {
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    {
                        <Space direction="horizontal" size="middle">
                            <Switch onChange={setIsPopup} checked={isPopup} />
                            <h4><a id="switch-cookie-selector">{t('field.evaluation.set_cookie_popup_path')}</a></h4>
                        </Space>
                    }
                    {
                        isPopup && popupSelector &&
                        <>
                            <span>{t('field.popup_selector.intro')}</span>
                            <SelectorInput selector={popupSelector} onChange={onPopupSelectorChange} />
                        </>
                    }
                </Space>
            }

            {
                isLoading &&
                <Space direction="vertical" size="large" style={{ 'width': '100%' }}>
                    <Space direction="horizontal"><Spin /><span>{t('loading')}</span></Space>
                    {
                        selector !== null && sampleUrl &&
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

            {
                !isLoading &&
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal" size="middle">
                        <Tooltip title={evaluationHelperMessage}>
                            <Button onClick={evaluateSelectorPath} disabled={!isEvaluationEnabled} data-testid="evaluate_btn" >
                                <span data-testid="evaluate_selector" >{t("field.action.evaluate_selector")}</span>
                            </Button>
                        </Tooltip>
                    </Space>
                </Space>
            }

            {
                evaluation &&
                <PreviewContent content={evaluation} />
            }

            {
                evaluation && !isPopup &&
                <Space direction="horizontal">
                    <QuestionCircleOutlined />
                    <span>{t('field.evaluation.screenshot_helper')}</span>
                    <a onClick={switchCookiePopupSelector} href="#switch-cookie-selector" title={t('field.evaluation.screenshot_helper_link_to_cookie_selector')}>
                        {t('field.evaluation.screenshot_helper_link_to_cookie_selector')}
                    </a>
                </Space>
            }

            {
                isBackendError && (
                    <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                        <Space direction="horizontal">
                            <CloseCircleOutlined className="error"></CloseCircleOutlined>
                            <span>{t("field.evaluation.backend_error")}</span>
                        </Space>
                    </Space>
                )
            }

        </Space >

    );
};



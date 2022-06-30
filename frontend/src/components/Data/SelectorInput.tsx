import React, { useState, useContext, useEffect } from "react";
import { Input, Space, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from '../../socket';
import { validateCssSelector } from '../../socket/scraping';
import { Data, DataSelector, SelectorStatus } from "../../interfaces/spider";


import './Data.scoped.css';


const { TextArea } = Input;


// const createSelector = (): DataSelector => {
//     return {
//         path: undefined
//     }
// };

interface ISelectorInputPropsType {
    selector: DataSelector;
    onChange: (selector: DataSelector) => void;
}


export const SelectorInput = (props: ISelectorInputPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { selector, onChange } = props;

    // TODO:
    // select the language(CSS, Xpath, jsonld, js)
    const socket = useContext<Socket>(SocketContext);

    /**
     * the textare input path
     * which will populate the selector object 
     */
    const [path, setPath] = useState<string>('');

    /**
     * sometimes shit happen on the backend side
     * we should be able to catch errors from the backend
     * and do something with it
     */
    const [isBackendError, setIsBackendError] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSelectorPathValid, setIsSelectorPathValid] = useState<boolean | undefined>(undefined);


    const validateSelector = (s: DataSelector) => {
        setIsLoading(true);
        setIsBackendError(false);
        validateCssSelector(socket, {}, selector, (isValid: boolean) => {
            setIsLoading(false);

            // TODO: manage backend errors
            // setIsBackendError(true);
            if (isValid) {
                setIsSelectorPathValid(true);
                selector.status = SelectorStatus.VALID;
            } else {
                setIsSelectorPathValid(false);
                selector.status = SelectorStatus.INVALID;
            }
        });
    };

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

        console.log("selector.path", selector.path);

        if (selector !== undefined) {
            selector.path = val;
            validateSelector(selector);
        }

        // call the parant onChange
        onChange(selector);
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
        // call the parant onChange
        const val = e.target.value;
        setPath(val);
        if (selector !== undefined) {
            selector.path = val;
            validateSelector(selector);
        }
        onChange(selector);
    };


    return (

        // TODO
        // border color depending on selector status
        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            {(selector?.path == undefined || selector?.path == '') &&
                <Space direction="horizontal">
                    <CloseCircleOutlined className="error"></CloseCircleOutlined>
                    <span data-testid="no_selector_path">{t('field.evaluation.no_selector_path')}</span>
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
                selector-path={selector.path}
            />

            {
                isLoading &&
                <>
                    <Space direction="horizontal"><Spin /><span>{t('loading')}</span></Space>
                    <Space direction="vertical" size="small">
                        <span style={{ 'display': 'inline-block' }}>
                            {t('field.evaluation.checking_validity')}
                        </span>
                    </Space>
                </>
            }

            {

                <Space direction="horizontal">
                    {
                        isSelectorPathValid
                            ? <>
                                <CheckCircleOutlined className="success" />
                                <span data-testid="css_path_valid" >{t("field.css.valid")}</span>
                            </>
                            : <>
                                <CloseCircleOutlined className="error" />
                                <span data-testid="css_path_invalid" >{t("field.css.invalid")}</span>
                            </>
                    }

                </Space>
            }

            {isBackendError && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span>{t("field.evaluation.backend_error")}</span>
                    </Space>
                </Space>
            )}

        </Space>

    );
};



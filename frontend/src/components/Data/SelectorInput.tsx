import React, { useState, useContext, useEffect } from "react";
import { Input, Space, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from '../../socket';
import { validateCssSelector } from '../../socket/scraping';
import { Data, DataSelector, SelectorStatus } from "../../interfaces/spider";


import './SelectorInput.scoped.css';


const { TextArea } = Input;


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

    const [inputClass, setInputClass] = useState<string>('');


    const validateSelector = (s: DataSelector) => {

        setIsBackendError(false);
        validateCssSelector(socket, {}, selector, (isValid: boolean) => {

            // TODO: manage backend errors
            // setIsBackendError(true);
            if (isValid) {
                setInputClass('success');
                selector.status = SelectorStatus.VALID;
                onChange(selector);
            } else {
                setInputClass('error');
                selector.status = SelectorStatus.INVALID;
                onChange(selector);
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

        if (selector !== undefined) {
            selector.path = val;
            validateSelector(selector);
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
        // call the parant onChange
        const val = e.target.value;
        setPath(val);
        if (selector !== undefined) {
            selector.path = val;
            validateSelector(selector);
        }
        onChange(selector);
    };

    useEffect(() => {

        console.log('SelectorInput initiated');

    }, [selector])


    return (

        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            <TextArea
                rows={4}
                placeholder={t("field.selector.input_placeholder")}
                onBlur={onSelectorBlur}
                onChange={onSelectorChange}
                value={path}
                data-testid="selectorPathInput"
                selector-path={selector.path}
                className={inputClass}
            />

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



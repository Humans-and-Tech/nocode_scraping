import React, { useState, useContext, useEffect } from "react";
import { Input, Space } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";

import { SocketContext } from '../../../socket';
import { validateCssSelector } from '../../../socket/scraping';
import { DataSelector, SelectorStatus } from "../../../interfaces/spider";


import './SelectorInput.scoped.css';


const { TextArea } = Input;


interface ISelectorInputPropsType {
    selector: DataSelector;
    onChange: (selector: DataSelector) => void;
}


export const SelectorInput = (props: ISelectorInputPropsType): JSX.Element => {

    const { t } = useTranslation("configurator");

    const { selector, onChange } = props;

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
        validateCssSelector(socket, {}, s, (isValid: boolean, err: Error | undefined) => {

            if (err) {
                setIsBackendError(true);
                setInputClass('error');
                s.status = SelectorStatus.INVALID;
            } else {

                if (isValid) {
                    setInputClass('success');
                    s.status = SelectorStatus.VALID;
                    onChange(s);
                } else {
                    setInputClass('error');
                    s.status = SelectorStatus.INVALID;
                    onChange(s);
                }

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
     * initializes the selector path if provided by the selector prop
     */
    useEffect(() => {
        if (selector.path) {
            setPath(selector.path);
        } else {
            setPath('');
        }
    }, [selector]);


    return (

        <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>

            <TextArea
                rows={4}
                placeholder={t("field.selector.input_placeholder")}
                onBlur={onSelectorChange}
                onChange={onSelectorChange}
                value={path}
                data-testid="selectorPathInput"
                className={inputClass}
            />

            {isBackendError && (
                <Space direction="vertical" size="middle" style={{ 'width': '100%' }}>
                    <Space direction="horizontal">
                        <CloseCircleOutlined className="error"></CloseCircleOutlined>
                        <span data-testid="backend_error">{t("field.evaluation.backend_error")}</span>
                    </Space>
                </Space>
            )}

        </Space>

    );
};



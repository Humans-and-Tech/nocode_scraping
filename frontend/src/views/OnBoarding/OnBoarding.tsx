import React, { useContext, useState } from "react";
import {
    Steps,
} from "antd";


import { useTranslation } from "react-i18next";

import { SocketContext } from "../../socket";

import "../../style.css";

const { Step } = Steps;

const OnBoarding: React.FC = () => {
    const { t } = useTranslation("onboarding");

    const socket = useContext(SocketContext);

    const [currentStep, setCurrentStep] = useState<number>(0);

    return (
        <>

            <Steps current={currentStep}>
                <Step title="Configure the website" description="Configure its URL and an optional proxy configuration" />
                <Step title="Choose the Page type" description="Is it a Product Page or a Category Page" />
                <Step title="Define the selectore" description="Define the CSS selector for each element of the page" />
            </Steps>

        </>
    );
};

export default OnBoarding;

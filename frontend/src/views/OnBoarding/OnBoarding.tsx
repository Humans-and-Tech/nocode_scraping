import React, { useContext } from "react";
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


    return (
        <>

            <Steps current={1}>
                <Step title="Finished" description="This is a description." />
                <Step title="In Progress" subTitle="Left 00:00:08" description="This is a description." />
                <Step title="Waiting" description="This is a description." />
            </Steps>

        </>
    );
};

export default OnBoarding;

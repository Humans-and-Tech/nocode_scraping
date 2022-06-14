import React, { useState, useContext } from "react";
import { Drawer, Input, Button, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { emit, propose } from '../../socket/events';
import { ScrapingElement } from "../../interfaces";

const { TextArea } = Input;

const Configurator = ({
  element,
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("scraping_field_configurator");

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [evaluation, setEvaluation] = useState<string | undefined>(undefined);

  const [selector, setSelector] = useState<string | undefined>(undefined);

  const socket = useContext<Socket>(SocketContext);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const changeSelector = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSelector(e.target.value);

    // pass the target value
    // not the selector, because the selector might
    // not be updated yet while the event is sent to the socket
    emit(socket, "set-scraping-element", {
      'name': element.name,
      'selector': e.target.value
    });
  };

  const evaluateSelector = (): void => {
    setEvaluation("3.90");
  };

  /**
   * reload the Drawer when the element
   * to be configured changes
   * and fetch a proposal for this element
   */
  useEffect(() => {
    toggleDrawer();
    propose(socket, element.name, (proposal) => {
      setSelector(proposal);
    })
  }, [element]);

  return (
    <Drawer
      title={t("title")}
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={isDrawerOpen}
    >
      <h2>{element.label}</h2>
      {selector && <p>{t("selector.proposal", { value: selector })}</p>}

      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <TextArea
          rows={4}
          placeholder={t("selector.input_placeholder")}
          onChange={changeSelector}
          value={selector}
        />

        {evaluation && (
          <p>
            <CheckCircleOutlined></CheckCircleOutlined>
            {t("evaluation.result", { value: evaluation })}
          </p>
        )}

        <Button onClick={evaluateSelector}>
          {t("action.evaluate_selector")}
        </Button>
      </Space>
    </Drawer>
  );
};

export default Configurator;

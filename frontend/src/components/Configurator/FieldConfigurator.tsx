import React, { useState, useContext } from "react";
import { Drawer, Input, Button, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

import { SocketContext } from "../../socket";
import { emit, evaluate } from '../../socket/events';
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'


const { TextArea } = Input;

const Configurator = ({
  element,
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

  const [evalUrl, setEvalUrl] = useState<string | undefined>(undefined);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [evaluation, setEvaluation] = useState<string | null>(null);

  const [selector, setSelector] = useState<Selector | undefined>(undefined);

  const socket = useContext<Socket>(SocketContext);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const changeSelectorPath = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSelector({
      url: "https://www.manomano.fr/p/echelle-de-toit-5-plans-modulable-jusque-685m-pas-de-33-17337447",
      element: {
        name: selector?.element.name
      },
      path: e.target.value
    });

    // pass the target value
    // not the selector, because the selector might
    // not be updated yet while the event is sent to the socket
    emit(socket, "set-scraping-element", {
      'name': element.name,
      'selector': e.target.value
    });
  };

  const evaluateSelectorPath = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    const s = selector;
    if (s !== undefined) {
      evaluate(socket, s, (content: string | null) => {
        setEvaluation(content);
      })
    }
  };

  /**
   * load the scraped URL
   * will be used to evaluate the selector
   */
  useEffect(() => {
    toggleDrawer();
    const config = configProvider.getConfig();
    setEvalUrl(config?.pageUrl);
    console.log('evalUrl', config?.pageUrl);
  }, [element]);

  return (
    <Drawer
      title={t("field.title")}
      placement="right"
      closable={false}
      onClose={toggleDrawer}
      visible={isDrawerOpen}
    >
      <h2>{element.label}</h2>
      {selector && <p>{t("field.selector.proposal", { value: selector })}</p>}

      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <TextArea
          rows={4}
          placeholder={t("field.selector.input_placeholder")}
          onChange={changeSelectorPath}
          value={selector?.path}
        />

        {evaluation && (
          <p>
            <CheckCircleOutlined></CheckCircleOutlined>
            {t("field.evaluation.result", { value: evaluation })}
          </p>
        )}

        {
          evalUrl !== undefined && selector?.path &&
          <Button onClick={evaluateSelectorPath}>
            {t("field.action.evaluate_selector")}
          </Button>
        }

        {
          selector?.path == undefined &&
          <Space direction="vertical" size="middle">
            <Button disabled>
              {t("field.action.evaluate_selector")}
            </Button>
            <p>{t('field.evaluation.no_selector_path')}</p>
          </Space>
        }

        {
          evalUrl === undefined &&
          <Space direction="vertical" size="middle">
            <Button disabled>
              {t("field.action.evaluate_selector")}
            </Button>
            <p>{t('field.evaluation.no_url')}</p>
          </Space>
        }

      </Space>
    </Drawer>
  );
};

export default Configurator;

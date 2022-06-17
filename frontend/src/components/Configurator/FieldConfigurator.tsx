import React, { useState, useContext } from "react";
import { Drawer, Input, Button, Space } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Socket } from "socket.io-client";


import { SocketContext } from "../../socket";
import { emit, evaluate, validateCssSelector } from '../../socket/events';
import { ScrapingElement, Selector } from "../../interfaces";
import { ScrapingContext, ScrapingConfigProvider } from '../../ConfigurationContext'


const { TextArea } = Input;


const createSelector = (): Selector => {
  return {
    element: {
      name: undefined
    }
  }
};


const Configurator = ({
  element
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("configurator");

  const configProvider = useContext<ScrapingConfigProvider>(ScrapingContext);

  /**
   * the URL from the config
   * to evaluate the CSS selector
   */
  const [evalUrl, setEvalUrl] = useState<string | undefined>(undefined);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  /**
   * the result of the CSS Selector evaluation on the URL (evalUrl)
   * scraped by the backend
   */
  const [evaluation, setEvaluation] = useState<string | null>(null);

  const [selector, setSelector] = useState<Selector | undefined>(undefined);

  const [isSelectorPathValid, setIsSelectorPathValid] = useState<boolean | undefined>(undefined);

  const socket = useContext<Socket>(SocketContext);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const changeSelectorPath = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    let p = selector;
    if (p === undefined) {
      p = createSelector();
    }
    p.path = e.target.value;

    validateCssSelector(socket, p, (isValid: boolean) => {
      if (isValid) {
        setSelector(p);
        setIsSelectorPathValid(true);
      } else {
        console.log('notify the user, selector is not valid');
        setIsSelectorPathValid(false);
      }
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

        {
          isSelectorPathValid &&
          <Space direction="horizontal">
            <CheckCircleOutlined />
            <span className="success">{t("field.css.valid")}</span>
          </Space>
        }

        {
          !isSelectorPathValid &&
          <Space direction="horizontal">
            <CloseCircleOutlined />
            <span className="error">{t("field.css.invalid")}</span>
          </Space>
        }

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

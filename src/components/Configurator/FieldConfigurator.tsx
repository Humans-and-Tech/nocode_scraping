import React, { useState } from "react";
import { Drawer, Input, Button, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { ScrapingElement } from "../../interfaces";

const { TextArea } = Input;

const Configurator = ({
  element,
}: {
  element: ScrapingElement;
}): JSX.Element => {
  const { t } = useTranslation("scraping_field_configurator");

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [proposal, setProposal] = useState<string | undefined>(undefined);

  const [evaluation, setEvaluation] = useState<string | undefined>(undefined);

  const [selector, setSelector] = useState<string | undefined>(undefined);

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const changeSelector = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSelector(e.target.value);
  };

  const evaluateSelector = (): void => {
    console.log(selector);
    setEvaluation("3.90");
  };

  /**
   * reload the Drawer when the element
   * to be configured changes
   *
   * --> fetch the proposal for this element
   */
  useEffect(() => {
    toggleDrawer();
    setProposal(".price");
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
      {proposal && <p>{t("selector.proposal", { value: proposal })}</p>}

      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <TextArea
          rows={4}
          placeholder={t("selector.input_placeholder")}
          onChange={changeSelector}
          value={proposal}
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

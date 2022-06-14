import React, { useState, useEffect, useContext } from "react";
import { Drawer, Input, Space } from "antd";
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined } from "@ant-design/icons";

import { SocketContext } from "../../socket";
import { emit } from '../../socket/events';
import { Socket } from "socket.io-client";
import debounce from "lodash/debounce";

const { TextArea } = Input;

const Configurator = ({ isOpen }: { isOpen: boolean }): JSX.Element => {
  const { t } = useTranslation("scraping_website_configurator");

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [isWebsiteValid, setIsWebsiteValid] = useState<boolean>(true);

  const [isProxyConfigValid, setIsProxyConfigValid] = useState<boolean>(true);

  const [website, setWebsite] = useState<string | undefined>(undefined);

  const [proxyConfig, setProxyConfig] = useState<string | undefined>(undefined);

  const socket = useContext<Socket>(SocketContext);

  const changeWebsite = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWebsite(e.target.value);

    // pass the target value
    // not the website, because the website might
    // not be updated yet while the event is sent to the socket
    emit(socket, "set-website", {
      'value': e.target.value
    });
  };

  const changeProxyConfig = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProxyConfig(e.target.value);

    // pass the target value
    // not the website, because the website might
    // not be updated yet while the event is sent to the socket
    emit(socket, "set-proxy", {
      'value': e.target.value
    });
  };

  const closeDrawer = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  return (
    <Drawer
      title={t("title")}
      placement="right"
      closable={false}
      onClose={closeDrawer}
      visible={isVisible}
    >
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <p>{t("website.helper_text")}</p>
        <TextArea
          rows={4}
          placeholder={t("website.placeholder")}
          onChange={changeWebsite}
        />

        {isWebsiteValid && (
          <p>
            <CheckCircleOutlined></CheckCircleOutlined>
            <span>{t("website.is_valid")}</span>
          </p>
        )}

        <p>{t("proxy_config.helper_text")}</p>
        <TextArea
          rows={4}
          placeholder={t("proxy_config.placeholder")}
          onChange={changeProxyConfig}
        />

        {isProxyConfigValid && (
          <p>
            <CheckCircleOutlined></CheckCircleOutlined>
            <span>{t("proxy_config.is_valid")}</span>
          </p>
        )}
      </Space>
    </Drawer>
  );
};

export default Configurator;

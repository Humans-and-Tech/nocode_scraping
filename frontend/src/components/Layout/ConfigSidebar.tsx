import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';

import './Config.scoped.css';

interface IConfigSidebarProps {
  children: JSX.Element;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Provides access to the Spider Config from a Page layout
 *
 * the opening / closure of the sidebar is triggered externally
 * by the isVisible function
 *
 */
export const ConfigSidebar = ({ children, isVisible, onClose }: IConfigSidebarProps): JSX.Element => {
  const { t } = useTranslation('configurator');

  return (
    <Drawer
      title={t('field.title')}
      size="large"
      placement="right"
      closable={false}
      onClose={onClose}
      visible={isVisible}
    >
      {children}
    </Drawer>
  );
};

import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';

import './Layout.scoped.css';

interface IConfigSidebarProps {
  children: JSX.Element;
  isVisible: boolean;
  title?: string;
  onClose: () => void;
}

/**
 * Provides access to the Spider Config from a Page layout
 *
 * the opening / closure of the sidebar is triggered externally
 * by the isVisible function
 *
 */
export const ConfigSidebar = ({ children, isVisible, title, onClose }: IConfigSidebarProps): JSX.Element => {
  const { t } = useTranslation('configurator');

  return (
    <Drawer
      title={title || t('field.title')}
      size="large"
      placement="right"
      closable={false}
      onClose={onClose}
      visible={isVisible}
      destroyOnClose={true}
    >
      {children}
    </Drawer>
  );
};

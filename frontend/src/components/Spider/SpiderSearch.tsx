import React, { useContext, useState } from 'react';
import { Space, Input, Spin, Anchor } from 'antd';
import { useTranslation } from 'react-i18next';

import { Spider } from '../../interfaces/spider';
import { BackendContext, IBackendServicesProvider } from '../../BackendSocketContext';

import './SpiderConfig.scoped.css';

const { Link } = Anchor;

interface SeachSpiderProps {
  onLoaded: (spider: Spider) => void;
}

export const SpiderSearch = (props: SeachSpiderProps): JSX.Element => {
  const { t } = useTranslation('onboarding');

  const { onLoaded } = props;

  const backendProvider = useContext<IBackendServicesProvider>(BackendContext);

  // const socket = useContext<Socket>(SpiderSocketContext);

  const [isProposalAccepted, setIsProposalAccepted] = useState<boolean | undefined>(undefined);

  const [spiderProposal, setSpiderProposal] = useState<Spider | undefined>(undefined);

  const [isProposalFound, setIsProposalFound] = useState<boolean | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState<string | undefined>('');

  const [nameStatus, setNameStatus] = useState<'' | 'error'>('');

  const changeName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (val == '') {
      setNameStatus('error');
    } else {
      setNameStatus('');
    }

    setIsProposalAccepted(false);
    setIsLoading(true);
    setName(e.target.value);
    setSpiderProposal(undefined);
    setIsProposalFound(undefined);

    if (val !== '') {
      backendProvider.spider.get(val, (data: Spider | undefined) => {
        setIsLoading(false);
        if (data !== null && data !== undefined) {
          setIsProposalFound(true);
          setSpiderProposal(data);
        } else {
          setIsProposalFound(false);
        }
      });
    }
  };

  const selectProposal = () => {
    if (spiderProposal !== undefined) {
      setIsProposalAccepted(true);

      // transmit the user input
      // to the parent component
      onLoaded(spiderProposal);
    }
  };

  const createNewSpider = () => {
    if (name !== '' && name !== undefined) {
      const s = backendProvider.spider.create(name);
      onLoaded(s);
    }
  };

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <h2>
        {isProposalAccepted
          ? t('configure.edit_config_title', { name: spiderProposal?.name })
          : t('configure.name_input_title')}
      </h2>
      <em>{t('configure.name_input_subtitle')}</em>

      <Input
        size="large"
        status={nameStatus}
        onChange={changeName}
        value={name}
        placeholder={t('configure.name_placeholder')}
        data-testid="spiderSearchInput"
      />
      {nameStatus == 'error' && <em className="error">{t('configure.name_input_invalid')}</em>}

      {isLoading && (
        <Space direction="horizontal" size="middle">
          <Spin></Spin>
          <span>{t('loading')}</span>
        </Space>
      )}

      {isProposalFound && (
        <Space direction="vertical" size="middle">
          <span data-testid="spider-select-proposal">{t('configure.proposal')}</span>
          <Anchor onClick={selectProposal}>
            <Link
              href="#"
              title={t('configure.proposal_spider', { name: spiderProposal?.name, type: spiderProposal?.pageType })}
            ></Link>
          </Anchor>
        </Space>
      )}

      {isProposalFound !== undefined && !isProposalFound && (
        <Space direction="vertical" size="middle">
          <span data-testid="spider-no-proposal-found">{t('configure.no_proposal_found')}</span>
          <Anchor onClick={createNewSpider}>
            <Link href="#" title={t('configure.create_spider')}></Link>
          </Anchor>
        </Space>
      )}
    </Space>
  );
};

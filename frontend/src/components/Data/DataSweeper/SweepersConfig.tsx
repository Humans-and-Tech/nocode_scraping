import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { Divider, Space, Spin, Button, List, Select, Alert, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import clone from 'lodash/clone';

import { ScrapingContext } from '../../../BackendContext';
import { IScrapingBackend } from '../../../BackendProvider';
import { Data, Spider } from '../../../interfaces/spider';
import { RemoveCharSweeper, RemoveFormState } from './RemoveCharSweeper';
import { ReplaceCharSweeper, ReplaceFormState } from './ReplaceCharSweeper';
import { SweepersResult } from './SweepersResult';
import { PadSweeper, PadFormState } from './PadSweeper';
import { ExtractData, RegexFormState } from './RegexSweeper';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';
import { displayMessage, NotificationLevel } from '../../Layout/UserNotification';

import './Sweepers.scoped.css';

const { Option } = Select;
const { Text } = Typography;

enum SweeperKey {
  removeChar = 'removeChar',
  replaceChar = 'replaceChar',
  pad = 'pad',
  regex = 'regex'
}

interface SweeperItem {
  value: SweeperKey;
  label: string;
  index: number;
  sweeperContentBefore: string | undefined;
  sweeperContentAfter: string | undefined;
  state: unknown;
}

function logSweeperItemList(items: Array<SweeperItem | undefined>) {
  const tmp = items.map((x) => `${x?.index}: ${x?.label}, ${x?.sweeperContentBefore} --> ${x?.sweeperContentAfter}`);
  console.log(tmp);
}

/**
 * Sweepers are meant to slightly cleanup the data scraped.
 * They are not meant to "change" the data, but to make them more readable / standard
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({ data, spider }: { data: Data; spider: Spider }): JSX.Element => {
  const { t } = useTranslation('sweepers');

  const backendProvider = useContext<IScrapingBackend>(ScrapingContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRetry, setIsRety] = useState<boolean>(false);

  /**
   * the content before being sweeped by a sweeper
   */
  const [contentBefore, setContentBefore] = useState<string | undefined>(undefined);

  /**
   * the content after being sweeped by a sweeper
   */
  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  const [selectedSweepersList, setSelectedSweepersList] = useState<Array<SweeperItem | undefined>>([]);

  /**
   * runs each time a sweeper is configured
   *
   * @param item
   * @param value
   */
  const updateContentAfter = (item: SweeperItem, state: unknown, value: string | undefined) => {
    if (!value) {
      deleteSweeper(item);
    } else {
      const _selectedSweepersList = clone(selectedSweepersList);
      item.sweeperContentAfter = value;
      item.state = state;
      _selectedSweepersList[item.index] = item;
      setSelectedSweepersList(_selectedSweepersList);
    }
  };

  /**
   * initially
   */
  const init = () => {
    if (data.selector && spider.sampleURLs) {
      setIsRety(false);
      setIsLoading(true);
      backendProvider.getContent(
        {},
        data.selector,
        spider.sampleURLs[0],
        data.popupSelector,
        (response: ScrapingResponse | ScrapingError) => {
          if (response.status == ScrapingStatus.SUCCESS && response.content) {
            setContentBefore(response.content);
            setContentAfter(response.content);
          } else {
            displayMessage(NotificationLevel.ERROR, t('loading_error'));
            // retry in case of failure
            setIsRety(true);
          }

          setIsLoading(false);
        }
      );
    }
  };

  const addMoreText = () => {
    return selectedSweepersList.length == 0 ? t('add_first_sweeper') : t('add_more_sweepers');
  };

  /**
   * removes a SweeperItem from the selectedSweepersList
   * by this operaiton SweeperItem indices are re-aligned with their position in the array
   *
   * @param _item
   */
  const deleteSweeper = (_item: SweeperItem) => {
    let _selectedSweepersList = clone(selectedSweepersList);
    _selectedSweepersList = _selectedSweepersList.filter((item: SweeperItem | undefined) => {
      return item && item.index !== _item.index;
    });

    // re-align index with position in array
    _selectedSweepersList.forEach((item: SweeperItem | undefined, index: number) => {
      if (item) {
        item.index = index;
      }
    });

    logSweeperItemList(_selectedSweepersList);

    setSelectedSweepersList(_selectedSweepersList);
  };

  const onAddSweeper = (value: SweeperKey) => {
    let label = '';
    if (value == SweeperKey.removeChar) {
      label = t('remove_char_label');
    } else if (value == SweeperKey.replaceChar) {
      label = t('replace_char_label');
    } else if (value == SweeperKey.pad) {
      label = t('pad_label');
    } else if (value == SweeperKey.regex) {
      label = t('regex_label');
    }
    const _selectedSweepersList = clone(selectedSweepersList);

    let _sweeperContentBefore = undefined;

    // make a copy of contentBefore
    // if the sweeper is the first in the list
    if (selectedSweepersList.length == 0) {
      _sweeperContentBefore = contentBefore?.slice();

      // the sweeper's contentBefore is the latest one contentAfter
    } else {
      _sweeperContentBefore = selectedSweepersList[selectedSweepersList.length - 1]?.sweeperContentAfter;
    }

    _selectedSweepersList.push({
      value: value,
      label: label,
      index: selectedSweepersList.length,
      sweeperContentBefore: _sweeperContentBefore,
      sweeperContentAfter: undefined,
      state: undefined
    });

    setSelectedSweepersList(_selectedSweepersList);
  };

  const renderSweeper = (item: SweeperItem): ReactNode => {
    if (item.value == SweeperKey.removeChar) {
      return (
        <RemoveCharSweeper
          initialState={item.state as RemoveFormState}
          onConfigured={(state: RemoveFormState, value: string | undefined) => updateContentAfter(item, state, value)}
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.replaceChar) {
      return (
        <ReplaceCharSweeper
          initialState={item.state as ReplaceFormState}
          onConfigured={(state: ReplaceFormState, value: string | undefined) => updateContentAfter(item, state, value)}
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.pad) {
      return (
        <PadSweeper
          initialState={item.state as PadFormState}
          onConfigured={(state: PadFormState, value: string | undefined) => updateContentAfter(item, state, value)}
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.regex) {
      return (
        <ExtractData
          initialState={item.state as RegexFormState}
          onConfigured={(state: RegexFormState, value: string | undefined) => updateContentAfter(item, state, value)}
          testdata={item.sweeperContentBefore}
        />
      );
    }
  };

  /**
   * scrape content based on a sample URL
   */
  useEffect(() => {
    if (!contentBefore) {
      init();
    } else if (selectedSweepersList.length == 0) {
      // there is no selected sweeper in the list
      setContentAfter(contentBefore);
    } else {
      //  first sweeper's content before is the content before
      const firstSweeper = selectedSweepersList[0];
      if (firstSweeper) {
        console.log('firstSweeper >> sweeperContentBefore', contentBefore);
        firstSweeper.sweeperContentBefore = contentBefore;
      }

      // the content after is the latest sweeper's content after
      const lastSweeper = selectedSweepersList[selectedSweepersList.length - 1];
      if (lastSweeper && lastSweeper.sweeperContentAfter) {
        console.log('lastSweeper >> setContentAfter', lastSweeper.sweeperContentAfter);
        setContentAfter(lastSweeper.sweeperContentAfter);
      }
    }
  }, [contentBefore, selectedSweepersList]);

  return (
    <>
      {isRetry && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert message={t('loading_error')} type="error" />
          <Button onClick={init} danger>
            {t('retry')}
          </Button>
        </Space>
      )}
      {isLoading && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert message={t('loading_scraped_content')} type="info" />
          <Spin size="large" style={{ width: '100%', marginTop: '3em', marginBottom: '3em' }} />
        </Space>
      )}
      {!isRetry && !isLoading && contentBefore && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text italic>{addMoreText()}</Text>

          <Select placeholder="Select a person" optionFilterProp="children" onChange={onAddSweeper}>
            <Option value="removeChar">{t('select_remove_char')}</Option>
            <Option value="replaceChar">{t('select_replace_char')}</Option>
            <Option value="pad">{t('select_pad')}</Option>
            <Option value="regex">{t('select_regex')}</Option>
          </Select>

          <List
            size="large"
            bordered
            dataSource={selectedSweepersList}
            renderItem={(item) =>
              item && (
                <List.Item
                  actions={[
                    <a
                      onClick={() => {
                        deleteSweeper(item);
                      }}
                      key={`delete-${item.value}`}
                    >
                      {t('delete_sweeper')}
                    </a>
                  ]}
                >
                  {renderSweeper(item)}
                </List.Item>
              )
            }
          />
          {contentAfter && (
            <>
              <Divider orientation="left">{t('divider_cleaning_preview') as ReactNode}</Divider>
              <SweepersResult contentBefore={contentBefore} contentAfter={contentAfter} />
            </>
          )}
        </Space>
      )}
    </>
  );
};

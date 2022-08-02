import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { Divider, Space, Spin, Button, List, Select, Alert, Typography } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import clone from 'lodash/clone';
import ReactDragListView from 'react-drag-listview';

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

/**
 * Sweepers are meant to cleanup the scraped data.
 * They are not meant to "change" the data, but to facilitate their integration
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
   * - each sweeper's ContentBefore, is the previous Sweeper's contentAfter
   * - a sweeper's index is aligned with the sweeper's position in the list
   *
   * @param _selectedSweepersList
   * @returns
   */
  const alignSweepersContentBeforeAndAfter = (_selectedSweepersList: Array<SweeperItem | undefined>) => {
    // re-align index with position in array
    // and re-align content before and content after
    _selectedSweepersList.forEach((item: SweeperItem | undefined, index: number) => {
      if (item) {
        item.index = index;
        if (index == 0) {
          item.sweeperContentBefore = contentBefore;
        } else {
          item.sweeperContentBefore = _selectedSweepersList[index - 1]?.sweeperContentAfter;
        }
      }
    });
    return _selectedSweepersList;
  };

  /**
   * when a sweeper is dragged n dropped in the list
   *
   * @param fromIndex
   * @param toIndex
   * @returns
   */
  const onDragEnd = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0) return; // Ignores if outside designated area

    let _selectedSweepersList = clone(selectedSweepersList);
    const _sweep = _selectedSweepersList.splice(fromIndex, 1)[0];
    _selectedSweepersList.splice(toIndex, 0, _sweep);

    // re-align index with position in array
    // and re-align content before and content after
    _selectedSweepersList = alignSweepersContentBeforeAndAfter(_selectedSweepersList);

    setSelectedSweepersList(_selectedSweepersList);
  };

  /**
   * recalculates the sweeper's contentAfter each time a sweeper is configured
   * and updates the next sweeper's contentBefore with this current sweeper's contentAfter
   *
   * @param item
   * @param value
   */
  const updateSweeperContentAfter = (item: SweeperItem, state: unknown, value: string | undefined) => {
    if (!value) {
      deleteSweeper(item);
    } else {
      const _selectedSweepersList = clone(selectedSweepersList);
      item.sweeperContentAfter = value;
      item.state = state;
      _selectedSweepersList[item.index] = item;

      //next sweeper:
      const next = _selectedSweepersList[item.index + 1];
      if (next) {
        next.sweeperContentBefore = value;
      }

      setSelectedSweepersList(_selectedSweepersList);
    }
  };

  /**
   * initialize contentBefore & contentAfter
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
    // and re-align content before and content after
    _selectedSweepersList = alignSweepersContentBeforeAndAfter(_selectedSweepersList);

    setSelectedSweepersList(_selectedSweepersList);
  };

  /**
   * creates a new sweeper
   * by default the sweeper's contentAfter = sweeper's contentBefore
   *
   * @param value
   */
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
      sweeperContentAfter: _sweeperContentBefore,
      state: undefined
    });

    setSelectedSweepersList(_selectedSweepersList);
  };

  const renderSweeper = (item: SweeperItem): ReactNode => {
    if (item.value == SweeperKey.removeChar) {
      return (
        <RemoveCharSweeper
          initialState={item.state as RemoveFormState}
          onConfigured={(state: RemoveFormState, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.replaceChar) {
      return (
        <ReplaceCharSweeper
          initialState={item.state as ReplaceFormState}
          onConfigured={(state: ReplaceFormState, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.pad) {
      return (
        <PadSweeper
          initialState={item.state as PadFormState}
          onConfigured={(state: PadFormState, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperKey.regex) {
      // the regex contentAfter is not renderable
      // thus we pass the sweeperContentBefore as sweeperContentAfter
      return (
        <ExtractData
          initialState={item.state as RegexFormState}
          onConfigured={(state: RegexFormState, value: string | undefined) =>
            updateSweeperContentAfter(item, state, item.sweeperContentBefore)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    }
  };

  /**
   * recalculate the contentAfter
   */
  useEffect(() => {
    console.log('> useEffect');
    if (!contentBefore) {
      init();
    } else if (selectedSweepersList.length == 0) {
      // there is no selected sweeper in the list
      setContentAfter(contentBefore);
    } else {
      //  first sweeper's content before is the content before
      const firstSweeper = selectedSweepersList[0];
      if (firstSweeper) {
        firstSweeper.sweeperContentBefore = contentBefore;
      }

      // the content after is the latest sweeper's content after
      const lastSweeper = selectedSweepersList[selectedSweepersList.length - 1];
      console.log(
        '> useEffect - lastSweeper',
        lastSweeper?.value,
        lastSweeper?.sweeperContentBefore,
        lastSweeper?.sweeperContentAfter
      );
      if (lastSweeper && lastSweeper.sweeperContentAfter) {
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

          <Select placeholder={t('select_sweeper_placeholder')} onSelect={onAddSweeper} style={{ width: '100%' }}>
            <Option value="removeChar">{t('select_remove_char_label')}</Option>
            <Option value="replaceChar">{t('select_replace_char_label')}</Option>
            <Option value="pad">{t('select_pad_label')}</Option>
            <Option value="regex">{t('select_regex_label')}</Option>
          </Select>

          <ReactDragListView nodeSelector="li.draggable" handleSelector="li" onDragEnd={onDragEnd}>
            <List
              size="large"
              bordered
              dataSource={selectedSweepersList}
              renderItem={(item) =>
                item && (
                  <List.Item
                    className="draggable"
                    style={{ width: '100%' }}
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
                    <DragOutlined />
                    {renderSweeper(item)}
                  </List.Item>
                )
              }
            />
          </ReactDragListView>
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

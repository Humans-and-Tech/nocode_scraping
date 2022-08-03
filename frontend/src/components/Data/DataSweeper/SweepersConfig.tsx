import React, { ReactNode, useEffect, useState, useContext } from 'react';
import { Divider, Space, Spin, Button, List, Select, Alert, Typography } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import cloneDeep from 'lodash/cloneDeep';
import ReactDragListView from 'react-drag-listview';

import { ScrapingContext } from '../../../BackendContext';
import { IScrapingBackend } from '../../../BackendProvider';
import { Data, Spider } from '../../../interfaces/spider';
import { RemoveCharSweeper } from './RemoveCharSweeper';
import { ReplaceCharSweeper } from './ReplaceCharSweeper';
import { SweepersResult } from './SweepersResult';
import { PadSweeper } from './PadSweeper';
import { ExtractData } from './RegexSweeper';
import {
  ReplaceSweeperType,
  RemoveSweeperType,
  PadSweeperType,
  RegexSweeperType,
  SweeperFunctionType,
  SweeperType
} from '../../../interfaces/spider';
import { ScrapingError, ScrapingResponse, ScrapingStatus } from '../../../interfaces/scraping';
import { displayMessage, NotificationLevel } from '../../Layout/UserNotification';

import './Sweepers.scoped.css';

const { Option } = Select;
const { Text } = Typography;

interface SweeperItem {
  value: SweeperFunctionType;
  index: number;
  sweeperContentBefore: string | undefined;
  sweeperContentAfter: string | undefined;
  state: SweeperType | undefined;
}

interface ISweepersConfigProps {
  data: Data;
  spider: Spider;
  onConfigured: (data: Data) => void;
}

/**
 * Sweepers are meant to cleanup the scraped data.
 * They are not meant to "change" the data, but to facilitate their integration
 *
 * @returns a JSX.Element
 */
export const DataSweepersConfig = ({ data, spider, onConfigured }: ISweepersConfigProps): JSX.Element => {
  const { t } = useTranslation('sweepers');

  /**
   * init the selectedSweepersList state with the data prop
   * @returns
   */
  const initializeSweepersList = () => {
    const _l: Array<SweeperItem> = [];
    data.sweepers?.forEach((s: SweeperType | undefined, i: number) => {
      if (s) {
        _l.push({
          value: s.key,
          index: i,
          sweeperContentBefore: undefined,
          sweeperContentAfter: undefined,
          state: s
        });
      }
    });
    return _l;
  };

  const backendProvider = useContext<IScrapingBackend>(ScrapingContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * in case of error to fetch scraped data
   * that will be used to visualize the effect of the sweepers
   */
  const [isRetry, setIsRety] = useState<boolean>(false);

  /**
   * the content before being sweeped by a sweeper
   */
  const [contentBefore, setContentBefore] = useState<string | undefined>(undefined);

  /**
   * the content after being sweeped by a sweeper
   */
  const [contentAfter, setContentAfter] = useState<string | undefined>(undefined);

  /**
   * the list of selected sweepers
   */
  const [selectedSweepersList, setSelectedSweepersList] = useState<Array<SweeperItem | undefined>>(() => {
    return initializeSweepersList();
  });

  /**
   * - each sweeper's ContentBefore, is the previous Sweeper's contentAfter
   * - a sweeper's index is aligned with the sweeper's position in the list
   *
   * @param _selectedSweepersList
   * @returns
   */
  const alignSweepersContentBeforeAndAfter = (_selectedSweepersList: Array<SweeperItem | undefined>) => {
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

    let _selectedSweepersList = cloneDeep(selectedSweepersList);
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
  const updateSweeperContentAfter = (item: SweeperItem, state: SweeperType | undefined, value: string | undefined) => {
    if (!value) {
      deleteSweeper(item);
    } else {
      const _selectedSweepersList = cloneDeep(selectedSweepersList);
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
  const initContent = () => {
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
    let _selectedSweepersList = cloneDeep(selectedSweepersList);
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
  const onAddSweeper = (value: SweeperFunctionType) => {
    const _selectedSweepersList = cloneDeep(selectedSweepersList);

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
      index: selectedSweepersList.length,
      sweeperContentBefore: _sweeperContentBefore,
      sweeperContentAfter: _sweeperContentBefore,
      state: {
        key: value
      }
    });

    setSelectedSweepersList(_selectedSweepersList);
  };

  const renderSweeper = (item: SweeperItem): ReactNode => {
    if (item.value == SweeperFunctionType.removeChar) {
      return (
        <RemoveCharSweeper
          initialState={item.state as RemoveSweeperType}
          onConfigured={(state: RemoveSweeperType, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperFunctionType.replaceChar) {
      return (
        <ReplaceCharSweeper
          initialState={item.state as ReplaceSweeperType}
          onConfigured={(state: ReplaceSweeperType, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperFunctionType.pad) {
      return (
        <PadSweeper
          initialState={item.state as PadSweeperType}
          onConfigured={(state: PadSweeperType, value: string | undefined) =>
            updateSweeperContentAfter(item, state, value)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    } else if (item.value == SweeperFunctionType.regex) {
      // the regex contentAfter is not renderable
      // thus we pass the sweeperContentBefore as sweeperContentAfter
      return (
        <ExtractData
          initialState={item.state as RegexSweeperType}
          onConfigured={(state: RegexSweeperType, value: string | undefined) =>
            updateSweeperContentAfter(item, state, item.sweeperContentBefore)
          }
          testdata={item.sweeperContentBefore}
        />
      );
    }
  };

  /**
   * - recalculate the contentAfter
   * - callback the onConfigured() when the selectedSweepersList changes
   */
  useEffect(() => {
    if (!contentBefore) {
      initContent();
    } else {
      // proceed to an update  of content

      if (selectedSweepersList.length == 0) {
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
        if (lastSweeper && lastSweeper.sweeperContentAfter) {
          setContentAfter(lastSweeper.sweeperContentAfter);
        }
      }

      // in all cases
      // finally, save the configuration of the sweepers
      // by creating a clone of the data which is immutable
      const dataClone = cloneDeep(data);
      dataClone.sweepers = [];

      selectedSweepersList.forEach((item: SweeperItem | undefined) => {
        if (item && item.state) {
          dataClone.sweepers?.push(item.state);
        }
      });

      if (dataClone) {
        onConfigured(dataClone);
      }
    }
  }, [contentBefore, selectedSweepersList]);

  return (
    <>
      {isRetry && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert message={t('loading_error')} type="error" />
          <Button onClick={initContent} danger>
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
            <Option value="removeChar">{t('remove_char_label')}</Option>
            <Option value="replaceChar">{t('replace_char_label')}</Option>
            <Option value="pad">{t('pad_label')}</Option>
            <Option value="regex">{t('regex_label')}</Option>
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

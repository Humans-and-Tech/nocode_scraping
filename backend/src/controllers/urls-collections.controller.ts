import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';

import cloneDeep from 'lodash/cloneDeep';

import { URLsCollection } from '../models/core';
import { IResponse, ResponseStatus } from '../models/api';
import { Spider, ISpider } from '../models/core';
import { User } from '../models/auth';
import { UrlsCollectionsService } from '../services/UrlsCollectionsService';
import { SpiderService } from '../services/SpiderService';
import { CreateUrlsCollectionDto } from './create-urls-collection.dto';
import logger from '../logging';

/**
 * REST API to access / modify a spider
 */
@Controller('urls-collections')
export class UrlsCollectionsController {
  constructor(
    private readonly urlsCollectionsService: UrlsCollectionsService,
    private readonly spiderService: SpiderService
  ) {}

  @Get(':collection')
  async onCollectionGet(@Param() params): Promise<IResponse> {
    const user = new User(params.userId);
    const result: URLsCollection = await this.urlsCollectionsService.getCollection(user, params.collection);
    return Promise.resolve({
      status: ResponseStatus.SUCCESS,
      data: result
    });
  }

  /**
   * retrieves the collection and replaces its urls if existing, or pushes a new collection of URL
   * if the collection name is not retrieved for this spider
   *
   * @param params
   * @param createDto
   * @returns
   */
  @Post()
  async addCollection(@Body() createDto: CreateUrlsCollectionDto): Promise<IResponse> {
    // TODO: userId or orgId fetched by header token ?
    const user = new User(1);
    const _tmpColl = new URLsCollection(createDto);
    const coll: URLsCollection = await this.urlsCollectionsService.getCollection(user, _tmpColl.key);
    const spider: Spider = await this.spiderService.getSpider(user, createDto.spiderName);

    if (!spider) {
      throw new Error(`Spider ${createDto.spiderName} does not exist`);
    }

    logger.info(`retrieved collection ${_tmpColl.key} with length ${coll?.urlsList?.length}`);

    let cloneColl: URLsCollection;
    if (coll) {
      cloneColl = new URLsCollection(cloneDeep(coll));
      cloneColl.urlsList = createDto.urlsList;
      logger.info(`urlsCollection '${coll.key}' existing, its urls will be replaced`);
    } else {
      logger.info(`urlsCollection '${_tmpColl.key}' does not exist, it will be created`);

      // this will create the key prop
      cloneColl = new URLsCollection({
        name: createDto.name,
        spiderName: createDto.spiderName,
        urlsList: createDto.urlsList
      });
    }

    await this.urlsCollectionsService.updateCollection(user, cloneColl);
    logger.info(`Updated collection ${createDto.name} for spider ${createDto.spiderName}`);

    // and update the spider consequently
    // to store the collections names
    const spiderClone: Spider = new Spider(cloneDeep(spider));
    if (!spiderClone.urlsCollections) {
      spiderClone.urlsCollections = [];
    }
    // manage duplicates
    let existingColl = false;
    spiderClone.urlsCollections.every((s: string) => {
      if (s == cloneColl.key) {
        existingColl = true;
        return false;
      }
      return true;
    });

    if (!existingColl) {
      spiderClone.urlsCollections.push(cloneColl.key);
      await this.spiderService.updateSpider(user, spiderClone);
      logger.info(
        `Updated spider ${spiderClone.name} with urls collection ${JSON.stringify(spiderClone.urlsCollections)}`
      );
    } else {
      // ignore it, do not add the collection, it already exists
      // it's the case where a collection is replaced
    }

    return Promise.resolve({
      status: ResponseStatus.SUCCESS
    });
  }

  @Delete(':collection')
  async DeleteUrlsCollection(@Param() params): Promise<IResponse> {
    // TODO: userId or orgId fetched by header token ?
    const user = new User(1);
    const coll = await this.urlsCollectionsService.getCollection(user, params.collection);

    logger.info(`DeleteUrlsCollection / retrieved collection ${params.collection}`);

    if (coll) {
      const spider: Spider = await this.spiderService.getSpider(user, coll.spiderName);
      if (!spider) {
        throw new Error(`DeleteUrlsCollection / Spider ${coll.spiderName} does not exist`);
      }

      // and update the spider consequently
      // to store the collections names
      const spiderClone: Spider = new Spider(cloneDeep(spider));
      if (!spiderClone.urlsCollections) {
        throw new Error(`DeleteUrlsCollection / Spider ${coll.spiderName} has no urls collection`);
      }

      let existingCollIndex = -1;
      spiderClone.urlsCollections.every((s: string, index: number) => {
        if (s == coll.key) {
          existingCollIndex = index;
          return false;
        }
        return true;
      });

      if (existingCollIndex > -1) {
        spiderClone.urlsCollections.splice(existingCollIndex, 1);
        await this.spiderService.updateSpider(user, spiderClone);
        logger.info(`DeleteUrlsCollection / Updated spider ${spiderClone.name}, removed urls collection ${coll.key}`);
      } else {
        // ignore it, the collection does not exist on the spider
        // it's not normal but it's not a big deal because we are anyway removing it
      }

      await this.urlsCollectionsService.deleteCollection(user, coll);
      logger.info(`DeleteUrlsCollection / Updated Urls Collection ${coll.key}`);

      return Promise.resolve({
        status: ResponseStatus.SUCCESS
      });
    } else {
      throw new Error(`DeleteUrlsCollection / Unknown collection ${params.collection} for spider ${params.spider}`);
    }
  }
}

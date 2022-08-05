import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';

import cloneDeep from 'lodash/cloneDeep';

import { Spider, URLsCollection } from '../models/core';
import { IResponse, ResponseStatus } from '../models/api';
import { User } from '../models/auth';
import { SpiderService } from '../services/SpiderService';
import {CreateUrlsCollectionDto} from './create-urls-collection.dto';
import logger from '../logging';

/**
 * REST API to access / modify a spider
 */
@Controller('spider')
export class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  @Get(':name')
  async onSpiderGet(@Param() params): Promise<IResponse> {
    
    const user = new User(params.userId);
    const result: Spider = await this.spiderService.getSpider(user, params.name);
    return Promise.resolve({
      status: ResponseStatus.SUCCESS,
      data: result
    });
    
  }

  /**
   * retrieves the collection name and replaces it if existing, or pushes a new collection of URL
   * to the spider's urlsCollection prop
   * 
   * @param params 
   * @param createDto 
   * @returns 
   */
  @Post(':name/urls-collection')
  async addUrlsCollection(@Param() params, @Body() createDto: CreateUrlsCollectionDto): Promise<IResponse> {

    // TODO: userId or orgId fetched by header token ?
    const user = new User(1);
    const spider = await this.spiderService.getSpider(user, params.name);

    logger.info(`retrieved spider ${params.name}, with ${spider.urlsCollections?.length} urlsCollection`);

    if (spider) {

      // spider is immutable
      // make a clone
      const cloneSpider = new Spider(cloneDeep(spider));

      let existingCollectionIndex = -1
      cloneSpider.urlsCollections?.every((item: URLsCollection, index: number) => {
        if (item.name === createDto.name) {
          existingCollectionIndex = index;
          // break
          return false;
        }
        return true;
      })

      if (existingCollectionIndex>-1){
        cloneSpider.urlsCollections[existingCollectionIndex] = createDto;
        logger.info(`urlsCollection ${createDto.name} is existing, its urls will be replaced`);
      } else {
        logger.info(`urlsCollection ${createDto.name} does not exist, it will be created`)
        if (!cloneSpider.urlsCollections) {
          cloneSpider.urlsCollections = []
        }
        cloneSpider.urlsCollections.push(createDto);
      }

      await this.spiderService.updateSpider(user, cloneSpider);
      logger.info(`Updated spider ${cloneSpider.name} with urlsCollection ${createDto.name}`)
      return Promise.resolve({
        status: ResponseStatus.SUCCESS,
      });

    } else {
      throw new Error(`Unknown spider ${createDto.name}`);
    }
    
  }

  @Delete(':name/urls-collections/:collectionName')
  async DeleteUrlsCollection(@Param() params): Promise<IResponse> {

    // TODO: userId or orgId fetched by header token ?
    const user = new User(1);
    const spider = await this.spiderService.getSpider(user, params.name);

    logger.info(`retrieved spider ${params.name}, with ${spider.urlsCollections?.length} urlsCollection`);

    if (spider) {

      // spider is immutable
      // make a clone
      const cloneSpider = new Spider(cloneDeep(spider));

      let existingCollectionIndex = -1
      cloneSpider.urlsCollections?.every((item: URLsCollection, index: number) => {
        if (item.name === params.collectionName) {
          existingCollectionIndex = index;
          // break
          return false;
        }
        return true;
      })

      if (existingCollectionIndex>-1){
        cloneSpider.urlsCollections.splice(existingCollectionIndex, 1);
        logger.info(`urlsCollection ${params.collectionName} removed on spider ${cloneSpider.name}`)
      } else {
        //ignore
        logger.info(`urlsCollection ${params.collectionName} not existing on spider ${cloneSpider.name}, DELETE ignored`)
      }

      await this.spiderService.updateSpider(user, cloneSpider);
      return Promise.resolve({
        status: ResponseStatus.SUCCESS,
      });

    } else {
      throw new Error(`Unknown spider ${params.name}`);
    }
    
  }
}

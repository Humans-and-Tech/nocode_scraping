import { Controller, Get, Param, Post, Body } from '@nestjs/common';

import { Spider, URLsCollection } from '../models/core';
import { IResponse, ResponseStatus } from '../models/api';
import { User } from '../models/auth';
import { SpiderService } from '../services/SpiderService';
import {CreateUrlsCollectionDto} from './create-urls-collection.dto';
import logger from '../logging';

@Controller('spider')
export class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  @Get(':name')
  async onSpiderGet(@Param() params): Promise<IResponse> {
    try {
      const user = new User(params.userId);
      const result: Spider = await this.spiderService.getSpider(user, params.name);
      return Promise.resolve({
        status: ResponseStatus.SUCCESS,
        data: result
      });
    } catch (err) {
      logger.error(err);
      return Promise.resolve({
        status: ResponseStatus.ERROR,
        message: JSON.stringify(err)
      });
    }
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
  async onUrlsCollectionPost(@Param() params, @Body() createDto: CreateUrlsCollectionDto): Promise<IResponse> {

    // TODO: userId or orgId fetched by header token ?
    const user = new User(1);
    const spider = await this.spiderService.getSpider(user, params.name);

    logger.info(`retrieved spider ${params.name}, with ${spider.urlsCollections?.length} urlsCollection`);

    if (spider) {

      let existingCollectionIndex = -1
      spider.urlsCollections?.every((item: URLsCollection, index: number) => {
        if (item.name === createDto.name) {
          existingCollectionIndex = index;
          // break
          return false;
        }
      })

      if (existingCollectionIndex>0){
        spider.urlsCollections[existingCollectionIndex] = createDto;
        logger.info(`urlsCollection ${createDto.name} is existing, its urls will be replaced`);
      } else {
        logger.info(`urlsCollection ${createDto.name} does not exist, it will be created`)
        if (!spider.urlsCollections) {
          spider.urlsCollections = []
        }
        spider.urlsCollections.push(createDto);
      }

      await this.spiderService.updateSpider(user, spider);
      logger.info(`Updated spider ${spider.name} with urlsCollection ${createDto.name}`)
      return Promise.resolve({
        status: ResponseStatus.SUCCESS,
      });

    } else {
      throw new Error(`Unknown spider ${createDto.name}`);
    }
    
  }
}

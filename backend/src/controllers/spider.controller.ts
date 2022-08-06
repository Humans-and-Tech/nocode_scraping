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
}

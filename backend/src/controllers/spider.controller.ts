
import { Controller, Get, Param} from '@nestjs/common';

import { Spider } from '../models/core';
import { IResponse, ResponseStatus } from '../models/api';
import { User } from '../models/auth';
import { SpiderService } from '../services/SpiderService';
import logger from '../logging';

const config = require('config');

@Controller("spider")
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

}

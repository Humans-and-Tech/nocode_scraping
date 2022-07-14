import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';

import { Spider, ISpider } from '../models/core';
import { IResponse, ResponseStatus } from '../models/api';
import { User } from '../models/auth';
import { SpiderService } from '../services/SpiderService';
import logger from '../logging';

const config = require('config');

@WebSocketGateway({
  namespace: 'spider'
})
export class SpiderEventGateway {
  constructor(private readonly spiderService: SpiderService) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('get')
  async onSpiderGet(@MessageBody('name') name: string, @MessageBody('userId') userId: number): Promise<IResponse> {
    try {
      const user = new User(userId);
      const result: Spider = await this.spiderService.getSpider(user, name);
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

  @SubscribeMessage('upsert')
  async onSpiderUpsert(
    @MessageBody('spider') spider: ISpider,
    @MessageBody('userId') userId: number
  ): Promise<IResponse> {
    try {
      const user = new User(userId);
      const typedSpider = new Spider(spider);

      // need to pass a real typed spider object
      // because the class name is used to store / retrieve the object
      const result: boolean = await this.spiderService.updateSpider(user, typedSpider);
      return Promise.resolve({
        status: ResponseStatus.SUCCESS,
        data: result
      });
    } catch (err) {
      logger.error(`Catched error ${err}`);
      return Promise.resolve({
        status: ResponseStatus.ERROR,
        message: JSON.stringify(err)
      });
    }
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';


import logger from '../logging';
import { Spider, ISpider } from '../models';
import {IWebSocketResponse, ResponseStatus} from '../models/api';
import { User } from '../models/auth';
import { SpiderService } from '../services/SpiderService';

const config = require('config');

@WebSocketGateway({
  namespace: 'spider'
})
export class SpiderEventGateway  {

  constructor(private readonly spiderService: SpiderService) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('get')
  async onSpiderGet(@MessageBody('name') name: string, @MessageBody('userId') userId: number): Promise<IWebSocketResponse> {
    try {
      const user = new User(userId);
      const result = await this.spiderService.getSpider(user, name);
      return Promise.resolve({
        'status': ResponseStatus.SUCCESS,
        'data': result
      });
    } catch(err) {
      logger.error(err);
      return Promise.reject({
        'status': ResponseStatus.ERROR,
        'message': err
      });
    }
  }

  @SubscribeMessage('upsert')
  async onSpiderUpsert(@MessageBody('spider') spider: ISpider, @MessageBody('userId') userId: number): Promise<IWebSocketResponse> {

    try {
      const user = new User(userId);
      const typedSpider = new Spider(spider)

      // need to pass a real typed spider object
      // because the class name is used to store / retrieve the object
      const result = this.spiderService.updateSpider(user, typedSpider);
      return Promise.resolve({
        'status': ResponseStatus.SUCCESS,
        'data': result
      });

    } catch(err) {
      logger.error(err);
      return Promise.reject({
        'status': ResponseStatus.ERROR,
        'message': err
      });
    }
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';
import logger from 'src/logging';
import { Spider } from 'src/models';
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
  async onSpiderGet(@MessageBody('name') name: string) {
    logger.info('get spider ' + name);
    try {
      return await this.spiderService.getSpider({}, name);
    } catch(err) {
      logger.error(err);
      return err;
    }
  }

  @SubscribeMessage('upsert')
  async onSpiderUpsert(@MessageBody('spider') spider: Spider) {
    logger.info('upsert spider ' + spider.name);
    try {
      return await this.spiderService.updateSpider({}, spider);
    } catch(err) {
      logger.error(err);
      return err;
    }
  }
}

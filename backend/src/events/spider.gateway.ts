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
    console.log('get spider', name);
    try {
      return await this.spiderService.getSpider({}, name);
    } catch(err) {
      logger.error(err);
      return err;
    }
  }

  @SubscribeMessage('upsert')
  async onSpiderUpsert(@MessageBody('spider') spider: Spider) {
    console.log('upsert spider', spider);
    // try {
    //   return await this.spiderService.getSpider({}, name);
    // } catch(err) {
    //   logger.error(err);
    //   return err;
    // }
  }
}

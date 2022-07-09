import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody
} from '@nestjs/websockets';
import logger from 'src/logging';
import { SpiderService } from '../services/SpiderService';

const config = require('config');

@WebSocketGateway({
  namespace: 'spider'
})
export class SpiderEventGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly spiderService: SpiderService) {}

  @WebSocketServer()
  server;

  async handleConnection() {
    // A client has connected
    console.log('connected');
  }

  async handleDisconnect() {
    console.log('disconnected');
  }

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
}

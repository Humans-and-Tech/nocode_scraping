import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';

import { IScrapingRequest, IWebSocketResponse, ResponseStatus } from '../models/api';
import { DataSelector } from '../models';
import { ScrapingService } from '../services/ScrapingService';
import logger from '../logging';

const config = require('config');

@WebSocketGateway({
  namespace: 'scraping'
})
export class ScrapingEventGateway  {

  constructor(private readonly scrapingService: ScrapingService) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('get-content')
  async onGetContent(@MessageBody() req: IScrapingRequest): Promise<IWebSocketResponse> {
    try {
        const result = await this.scrapingService.getContent(req);
        return Promise.resolve({
          status: ResponseStatus.SUCCESS,
          data: result
        });
    } catch(err) {
        logger.error(err);
        return Promise.reject({
          'status': ResponseStatus.ERROR,
          'message': err
        });
    }
  }

  @SubscribeMessage('validate-selector')
  async onValidateSelector(@MessageBody() s: DataSelector): Promise<IWebSocketResponse> {
    try {
        const result = await this.scrapingService.validateSelector(s);
        return Promise.resolve({
          status: ResponseStatus.SUCCESS,
          data: result
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

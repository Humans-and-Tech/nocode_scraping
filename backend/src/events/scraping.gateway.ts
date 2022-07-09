import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';
import { IScrapingRequest } from 'src/interfaces/scraping';
import logger from 'src/logging';
import { DataSelector } from 'src/models';
import { ScrapingService } from '../services/ScrapingService';

const config = require('config');

@WebSocketGateway({
  namespace: 'scraping'
})
export class ScrapingEventGateway  {

  constructor(private readonly scrapingService: ScrapingService) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('get-content')
  async onGetContent(@MessageBody() req: IScrapingRequest) {
    logger.info('get-content', req);
    try {
        return await this.scrapingService.getContent(req);
    } catch(err) {
        logger.error(err);
        return err;
    }
  }

  @SubscribeMessage('validate-selector')
  async onValidateSelector(@MessageBody() s: DataSelector) {
    logger.info('validate-selector');
    try {
        return await this.scrapingService.validateSelector(s);
    } catch(err) {
        logger.error(err);
        return err;
    }
  }
}

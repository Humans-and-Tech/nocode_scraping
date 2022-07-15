import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';

import { IScrapingRequest, IScrapingResponse } from '../models/api';
import { DataSelector, ScrapingStatus } from '../models/core';
import { ScrapingService } from '../services/ScrapingService';
import { DataSelectorValidityError, ScrapingError } from '../errors';
import logger from '../logging';

@WebSocketGateway({
  namespace: 'scraping'
})
export class ScrapingEventGateway {
  constructor(private readonly scrapingService: ScrapingService) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('get-content')
  async onGetContent(@MessageBody() req: IScrapingRequest): Promise<IScrapingResponse> {
    try {
      const result = await this.scrapingService.getContent(req);
      return Promise.resolve({
        status: ScrapingStatus.SUCCESS,
        data: result
      });
    } catch (err) {
      logger.error(err);
      if (err instanceof ScrapingError) {
        return Promise.resolve({
          status: err.status,
          selector: err.selector
        });
      } else {
        return Promise.resolve({
          status: ScrapingStatus.ERROR,
          message: JSON.stringify(err)
        });
      }
    }
  }

  @SubscribeMessage('validate-selector')
  async onValidateSelector(@MessageBody() s: DataSelector): Promise<IScrapingResponse> {
    try {
      const result = await this.scrapingService.validateSelector(s);
      return Promise.resolve({
        status: ScrapingStatus.SUCCESS,
        data: result
      });
    } catch (err) {
      logger.error(err);
      if (err instanceof DataSelectorValidityError) {
        // need to convey a status INVALID_SELECTOR to the frontend
      } else {
        return Promise.resolve({
          status: ScrapingStatus.ERROR,
          message: JSON.stringify(err)
        });
      }
    }
  }
}

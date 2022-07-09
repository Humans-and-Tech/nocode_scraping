import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';

import { SpiderEventGateway } from './events/spider.gateway';
import { ScrapingEventGateway } from './events/scraping.gateway';

import { SpiderService } from './services/SpiderService';
import { ScrapingService } from './services/ScrapingService'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    SpiderEventGateway, 
    ScrapingEventGateway,
    SpiderService,
    ScrapingService,
  ]
})
export class AppModule {}

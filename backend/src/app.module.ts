import { Module } from '@nestjs/common';

import { UrlsCollectionsController } from './controllers/urls-collections.controller';
import { SpiderController } from './controllers/spider.controller';
import { SpiderEventGateway } from './events/spider.gateway';
import { ScrapingEventGateway } from './events/scraping.gateway';

import { SpiderService } from './services/SpiderService';
import { ScrapingService } from './services/ScrapingService';
import { UrlsCollectionsService } from './services/UrlsCollectionsService';

@Module({
  imports: [],
  controllers: [UrlsCollectionsController, SpiderController],
  providers: [SpiderEventGateway, ScrapingEventGateway, SpiderService, ScrapingService, UrlsCollectionsService]
})
export class AppModule {}

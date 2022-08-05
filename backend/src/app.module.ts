import { Module } from '@nestjs/common';

import { SpiderController } from './controllers/spider.controller';
import { SpiderEventGateway } from './events/spider.gateway';
import { ScrapingEventGateway } from './events/scraping.gateway';

import { SpiderService } from './services/SpiderService';
import { ScrapingService } from './services/ScrapingService';

@Module({
  imports: [],
  controllers: [SpiderController],
  providers: [SpiderEventGateway, ScrapingEventGateway, SpiderService, ScrapingService]
})
export class AppModule {}

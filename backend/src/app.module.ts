import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { SpiderService } from './services/SpiderService';
import { SpiderEventGateway } from './events/spider.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpiderEventGateway, SpiderService]
})
export class AppModule {}

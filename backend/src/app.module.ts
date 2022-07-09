import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { SpiderEventGateway } from './events/spider.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpiderEventGateway]
})
export class AppModule {}

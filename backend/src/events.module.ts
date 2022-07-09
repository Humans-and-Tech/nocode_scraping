import { Module } from '@nestjs/common';
import { SpiderEventGateway } from './events/spider.gateway';

@Module({
  providers: [SpiderEventGateway]
})
export class EventsModule {}

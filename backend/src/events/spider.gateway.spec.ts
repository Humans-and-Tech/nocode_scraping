import { Test, TestingModule } from '@nestjs/testing';
import { SpiderService } from '../services/SpiderService';
import { SpiderEventGateway } from './spider.gateway';
import {IWebSocketResponse, ResponseStatus} from '../models/api';

describe('SpiderEventGateway', () => {
  let controller: SpiderEventGateway;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SpiderEventGateway],
      providers: [SpiderService]
    }).compile();

    controller = app.get<SpiderEventGateway>(SpiderEventGateway);
  });

  describe('root', () => {
    const expectedResponse = {
        'status': ResponseStatus.SUCCESS,
        'data': {
          
        }
      }
    it('should return "Hello World!"', () => {
      expect(controller.onSpiderGet).toBe('Hello World!');
    });
  });
});

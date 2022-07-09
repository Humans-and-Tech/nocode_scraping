import { Test, TestingModule } from '@nestjs/testing';
// import { AppController } from './spider.controller';
import { SpiderController } from './spider.controller';

describe('AppController', () => {
  let appController: SpiderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SpiderController],
      providers: []
    }).compile();

    appController = app.get<SpiderController>(SpiderController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

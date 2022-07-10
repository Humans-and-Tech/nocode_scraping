import { Test, TestingModule } from '@nestjs/testing';

import {Spider, Class} from '../models/core';
import {Organization} from '../models/auth';
import {Storable} from '../models/db';
import {IWebSocketResponse, ResponseStatus} from '../models/api';

import { SpiderService } from '../services/SpiderService';
import { SpiderEventGateway } from './spider.gateway';

import {get} from '../database';

const mockedSpider = new Spider({
      name: 'bla',
    });

/**
 * mock the database access
 */
jest.mock('../database', () => ({
  get: async (organization: Organization, dataType, key: string) => {
    return Promise.resolve(mockedSpider);
  }
}));

describe('SpiderEventGateway', () => {
  let controller: SpiderEventGateway;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SpiderEventGateway],
      providers: [SpiderService]
    }).compile();

    controller = app.get<SpiderEventGateway>(SpiderEventGateway);
  });

  describe('get a spider', () => {
    const expectedResponse: IWebSocketResponse = {
        'status': ResponseStatus.SUCCESS,
        'data': mockedSpider
      }
    it('should return the mocked spider', async () => {
      const response = await controller.onSpiderGet('test-spider', 0);
      expect(response).toStrictEqual(expectedResponse);
    });
  });
});

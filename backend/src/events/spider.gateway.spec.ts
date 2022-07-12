import { Test, TestingModule } from '@nestjs/testing';

import { Spider } from '../models/core';
import { Organization } from '../models/auth';
import { IResponse, ResponseStatus } from '../models/api';

import { SpiderService } from '../services/SpiderService';
import { SpiderEventGateway } from './spider.gateway';

import { get, upsert } from '../database';

const mockedSpider = new Spider({
  name: 'bla'
});

/**
 * mock the database access
 */
jest.mock('../database', () => ({
  get: async (organization: Organization, Spider, key: string) => {
    if (key==="found") {
      return Promise.resolve(mockedSpider);
    } else if (key==="not-found") {
      return Promise.resolve(undefined);
    } else if (key==="error") {
      return Promise.reject(new Error("an error occured"));
    }
  },
  upsert: async (organization: Organization, data: Spider) => {
    if (data.name=="existing-spider") {
      return Promise.resolve(true);
    } else if (data.name=="non-existing-spider") {
      return Promise.resolve(true);
    } else if (data.name=="error-spider"){
      return Promise.reject(new Error("an error occured"));
    }
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
    
    const expectedResponse: IResponse = {
      status: ResponseStatus.SUCCESS,
      data: mockedSpider
    };
    const undefinedResponse: IResponse = {
      status: ResponseStatus.SUCCESS,
      data: undefined
    };

    it('should return a spider', async () => {
      const response = await controller.onSpiderGet('found', 0);
      expect(response).toStrictEqual(expectedResponse);
    });
    it('should return undefined when non existing', async () => {
      const response = await controller.onSpiderGet('not-found', 0);
      expect(response).toStrictEqual(undefinedResponse);
    });
    it('should return an error status in case of DB error', async () => {
      const response = await controller.onSpiderGet('error', 0);
      // nevermind the message
      expect(response).toHaveProperty('status', ResponseStatus.ERROR);
    });

  });

  describe('upsert a spider', () => {
    const expectedResponse: IResponse = {
      status: ResponseStatus.SUCCESS,
      data: mockedSpider
    };

    it('should return true when existing', async () => {
      const response = await controller.onSpiderUpsert({
        name: 'existing-spider'
      }, 0);
      const expectedResponse: IResponse = {
        status: ResponseStatus.SUCCESS,
        data: true
      };
      expect(response).toStrictEqual(expectedResponse);
    });

    it('should return true when non existing', async () => {
      const response = await controller.onSpiderUpsert({
        name: 'non-existing-spider'
      }, 0);
      const expectedResponse: IResponse = {
        status: ResponseStatus.SUCCESS,
        data: true
      };
      expect(response).toStrictEqual(expectedResponse);
    });

    it('should return an error status in case of DB error', async () => {
      const response = await controller.onSpiderUpsert({
        name: 'error-spider'
      }, 0);
      const expectedResponse: IResponse = {
        status: ResponseStatus.ERROR,
        message: 'an error occured'
      };
      expect(response).toHaveProperty('status', ResponseStatus.ERROR);
    });
  });
});

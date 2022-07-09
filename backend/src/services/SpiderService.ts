import { Injectable } from '@nestjs/common';

import { Spider } from '../models';
import { upsert, get } from '../database';


@Injectable()
export class SpiderService {

  /**
   *
   * @param organization
   * @param data
   * @returns true if the document is created, false if updated
   */
  async updateSpider (
    user: unknown,
    spider: Spider,
    // callback: (resp: boolean, error: Error | undefined) => void
  ): Promise<boolean> {

    const organizationName = 'test';
    const docName = `${organizationName}/spiders/${spider.name}`;
    const b: boolean = await upsert<Spider>({ name: 'test' }, spider, docName);
    return Promise.resolve(b);
  };

  /**
   *
   * @param organization
   * @param name
   * @returns the document if it is found else null
   */
  async getSpider (
    user: unknown,
    name: string,
    // callback: (resp: Spider | undefined, error: Error | undefined) => void
  ): Promise<Spider> {
    
    if (name === '') {
      return Promise.reject('spider name cannot be blank');
    }

    const organizationName = 'test';
    const docName = `${organizationName}/spiders/${name}`;
    const spider = await get<Spider>({ name: 'test' }, docName);
    return Promise.resolve(spider);
    
  };
}
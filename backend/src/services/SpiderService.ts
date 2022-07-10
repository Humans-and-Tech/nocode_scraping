import { Injectable } from '@nestjs/common';

import { Spider } from '../models/core';
import { upsert, get } from '../database';
import { User } from '../models/auth';


@Injectable()
export class SpiderService {

  /**
   *
   * @param organization
   * @param data
   * @returns true if the document is created, false if updated
   */
  async updateSpider (
    user: User,
    spider: Spider,
  ): Promise<boolean> {

    const b: boolean = await upsert<Spider>(user.organization, spider);
    return Promise.resolve(b);
  };

  /**
   *
   * @param organization
   * @param name
   * @returns the document if it is found else null
   */
  async getSpider (
    user: User,
    name: string,
  ): Promise<Spider> {
    
    if (name === '') {
      return Promise.reject('spider name cannot be blank');
    }

    /**
     * for the runtime constraints, we must pass the expected object class name
     * so that the generic method get<> knows which object to return
     * because TS get<Spider> is just for compilation, not for the runtime
     */
    const spider = await get<Spider>(user.organization, Spider, name);
    return Promise.resolve(spider);
    
  };
}
import { Injectable } from '@nestjs/common';

import { URLsCollection } from '../models/core';
import { upsert, get, remove } from '../database';
import { User } from '../models/auth';

@Injectable()
export class UrlsCollectionsService {
  async updateCollection(user: User, collection: URLsCollection): Promise<boolean> {
    const b: boolean = await upsert<URLsCollection>(user.organization, collection);
    return Promise.resolve(b);
  }

  async getCollection(user: User, collection: string): Promise<URLsCollection> {
    if (collection === '') {
      return Promise.reject('collection key cannot be blank');
    }

    /**
     * for the runtime constraints, we must pass the expected object class name
     * so that the method knows which object to return
     * because TS is just for the compile time, not for the runtime
     */
    const coll = await get<URLsCollection>(user.organization, URLsCollection, collection);
    return Promise.resolve(coll);
  }

  async deleteCollection(user: User, collection: URLsCollection): Promise<boolean> {
    const b: boolean = await remove<URLsCollection>(user.organization, collection);
    return Promise.resolve(b);
  }
}

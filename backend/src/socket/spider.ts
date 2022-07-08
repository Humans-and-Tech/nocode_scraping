import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';

import { Spider } from '../models';
import { firestore, upsert, isFireStoreError } from '../database';
import logger from '../logging';

module.exports = () => {
  /**
   *
   * @param organization
   * @param data
   * @returns true if the document is created, false if updated
   */
  const updateSpider = async function (
    user: unknown,
    spider: Spider,
    callback: (resp: boolean, error: Error | undefined) => void
  ) {
    const organizationName = 'test';

    try {
      const configCollection: DocumentData = firestore.collection(`organizations`);
      const document = configCollection.doc(`${organizationName}/spiders/${spider.name}`);
      const b: boolean = await upsert({name: 'test'}, spider, document);
      callback(b, undefined);
    } catch (error) {
      logger.error('updateSpider error', error);
      callback(false, error as Error);
    }
  };

  /**
   *
   * @param organization
   * @param name
   * @returns the document if it is found else null
   */
  const getSpider = async function (
    user: unknown,
    name: string,
    callback: (resp: Spider | undefined, error: Error | undefined) => void
  ) {
    if (name === '') {
      return Promise.reject('spider name cannot be blank');
    }

    const organizationName = 'test';

    const configCollection: DocumentData = firestore.collection(`organizations`);

    const document = configCollection.doc(`${organizationName}/spiders/${name}`);

    try {
      const snap: DocumentSnapshot<Spider> = await document.get();
      callback(snap.data(), undefined);
    } catch (error) {
      if (isFireStoreError(error) && error.code === 5) {
        // this is a document not found error
      } else {
        logger.error('Unhandled error', error);
      }
      callback(undefined, error as Error);
    }
  };

  return {
    getSpider,
    updateSpider
  };
};

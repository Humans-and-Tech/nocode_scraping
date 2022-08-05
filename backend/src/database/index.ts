import { Firestore } from '@google-cloud/firestore';
import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';
import { pickBy } from 'lodash';

import { Class } from '../models/core';
import { Storable } from '../models/db';
import { Organization } from '../models/auth';
import logger from '../logging';

// Create a new client
// the authentication is done through the firestore-creds.json which is stored at the root of the project
// and the path of which is passed as env variable when launching node
export const firestore = new Firestore();

export interface FireStoreError {
  code: number;
  details: string;
  [field: string]: unknown;
}

export function isFireStoreError(obj: unknown): obj is FireStoreError {
  return typeof obj === 'object' && obj !== null && 'code' in obj && 'details' in obj;
}

/**
 * the document is stored / updated with the key `organization.name/data.constructor.name.toLowerCase()+'s'/docKey`
 *
 * Example:
 *    upsert(new Organization('test'), new Spider(...), 'myspider')
 *    --> the doc will store under the path `test/spiders/myspider`
 *
 * @param organization the organization's name is used in the doc path
 * @param data a typed object which extends the `Storable` class
 * @param docKey a string, representing the document unique key
 * @returns
 */
// @ts-ignore
export async function  upsert<T extends Storable>(organization: Organization, data: T): Promise<boolean> {
  const docPath = `${organization.name}/${data.constructor.name.toLowerCase()}s/${data.key}`;
  const configCollection: DocumentData = firestore.collection(`organizations`);
  const document = configCollection.doc(docPath);

  // cleanup undefined values
  // which cause an error on firestore
  // error is: Unhandled error Update() requires either a single JavaScript object or an alternating list of field/value pairs that can be followed by an optional precondition
  const cleanData = pickBy(data, function (value) {
    return !(value === undefined);
  });


  logger.debug(`upserting ${JSON.stringify(cleanData)}`);

  try {
    await document.update(cleanData);
    logger.debug(`Updated doc with key ${data.key}`);
    return Promise.resolve(true);
  } catch (error: unknown) {
    if (isFireStoreError(error) && error.code === 5) {
      // this is a document not found error
      await document.create(cleanData);
      logger.info(`Created doc with key ${data.key}`);
      return Promise.resolve(true);
    } else {
      logger.error('Unhandled error', error);
      return Promise.reject(error);
    }
  }
}

/**
 * retrieves a document identified by its `key` in the branch `${organization.name}/${dataType.name.toLowerCase()}s/${key}`
 *
 * May the document not exist, the value `undefined is returned`.
 * An error is only thrown in case of technical issue with the DB
 *
 * @param organization
 * @param dataType is required to build the document path in runtime, the type must extend the `Storable` class
 * @param key the unique key string to retrieve the document
 * @returns
 */
// @ts-ignore
export async function get<T extends Storable>(organization: Organization, dataType: Class<T>, key: string): Promise<T> {
  const docPath = `${organization.name}/${dataType.name.toLowerCase()}s/${key}`;
  const configCollection: DocumentData = firestore.collection(`organizations`);
  const document = configCollection.doc(docPath);

  logger.info('Looking for doc in Path ' + docPath);

  try {
    const snap: DocumentSnapshot<T> = await document.get();
    return Promise.resolve(snap.data());
  } catch (error) {
    if (isFireStoreError(error) && error.code === 5) {
      // this is a document not found error
      return Promise.resolve(undefined);
    } else {
      logger.error('Unhandled error', error);
      return Promise.reject(error);
    }
  }
}

import { Firestore } from '@google-cloud/firestore';

import { Organization } from '../interfaces/auth';
import logger from '../logging';

// Create a new client
// the authentication is done through the firestore-creds.json
// which is stored at the root of the project
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
 * creates or updates a document
 *
 * @param organization
 * @param data
 * @param document
 * @returns true if the document is created, false if updated
 */
// @ts-ignore
export async function upsert(organization: Organization, data: any, document: any): Promise<boolean> {
  try {
    await document.update(data);
    return Promise.resolve(true);
  } catch (error: unknown) {
    if (isFireStoreError(error) && error.code === 5) {
      // this is a document not found error
      logger.warn('Document not found, creating it');
      await document.create(data);
      return Promise.resolve(true);
    } else {
      logger.error('Unhandled error', error);
      return Promise.reject(error);
    }
  }
}

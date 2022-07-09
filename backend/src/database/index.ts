import { Firestore } from '@google-cloud/firestore';
import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';

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
export async function upsert<T>(organization: Organization, data: T, documentName: string): Promise<boolean> {
  
  const organizationName = 'test';
  const configCollection: DocumentData = firestore.collection(`organizations`);
  const document = configCollection.doc(documentName);
  
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

/**
 * creates or updates a document
 *
 * @param organization
 * @param data
 * @param document
 * @returns true if the document is created, false if updated
 */
// @ts-ignore
export async function get<T>(organization: Organization, documentName: string): Promise<T> {
  
  const configCollection: DocumentData = firestore.collection(`organizations`);
  const document = configCollection.doc(documentName);

    try {
      const snap: DocumentSnapshot<T> = await document.get();
      return Promise.resolve(snap.data());
    } catch (error) {
      if (isFireStoreError(error) && error.code === 5) {
        // this is a document not found error
        return Promise.resolve(undefined);
      } else {
        logger.error('Unhandled error', error);
      }
      return Promise.reject(error);
    }
}

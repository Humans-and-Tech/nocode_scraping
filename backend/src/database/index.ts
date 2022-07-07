import { Firestore } from '@google-cloud/firestore';
import { Organization } from '../interfaces/auth';

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

export function isFireStoreError(obj: any): obj is FireStoreError {
  return 'code' in obj && 'details' in obj && Number.isFinite(obj.code);
}

/**
 * creates or updates a document
 *
 * @param organization
 * @param data
 * @param document
 * @returns true if the document is created, false if updated
 */
export async function upsert(organization: Organization, data: any, document: any): Promise<boolean> {
  try {
    // values cannot be undefined
    // thus replace undefined by JSON.stringify({})
    await document.update(data);
    return Promise.resolve(true);
  } catch (error: unknown) {
    if (isFireStoreError(error) && error.code === 5) {
      // this is a document not found error
      await document.create(data);
      return Promise.resolve(true);
    } else {
      console.error('Unhandled error', error);
      return Promise.reject(error);
    }
  }
}

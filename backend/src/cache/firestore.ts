import { brotliCompress, brotliDecompress } from 'zlib';
import { Buffer } from 'buffer';
import { promisify } from 'util';

import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';
import { firestore, upsert } from '../database';
import { ICachedContent, ISavePageContent, IGetPageContent } from '.';
import logger from '../logging';

/**
 * stores brorli compressed (HTML) content, encoded in base64,
 * into Firestore under the key `${organizationName}/cache/${key}`
 *
 * @param key
 * @param content
 * @returns
 */
export const cachePageContent: ISavePageContent = async (
  key: string,
  content: string
): Promise<boolean | undefined> => {
  const organizationName = 'test';
  try {
    const configCollection: DocumentData = firestore.collection(`organizations`);
    const document = configCollection.doc(`${organizationName}/cache/${key}`);

    // compress the content and store it
    brotliCompress(Buffer.from(content), async function (err: Error | null, compressed: Buffer) {
      if (err) {
        logger.error(err);
        return Promise.reject(false);
      }
      try {
        if (compressed) {
          await upsert({ name: 'test' }, { content: compressed.toString('base64') }, document);
          return Promise.resolve(true);
        } else {
          logger.error(`undefined compressed content`);
          Promise.resolve(false);
        }
      } catch (error) {
        logger.error(error);
        return Promise.reject(false);
      }
    });
  } catch (error) {
    logger.error(error);
    return Promise.reject(false);
  }
};

/**
 * loads a base64 encoded compressed content stored in Firestore in the document `${organizationName}/cache/${key}`
 * and uncompresses it with a Brotli algorithm
 * so that the function returns HTML, not compressed data
 *
 * @param key
 * @returns Promise<ICachedContent>
 */
export const loadPageContentFromCache: IGetPageContent = async (key: string): Promise<ICachedContent | undefined> => {
  const organizationName = 'test';
  const configCollection: DocumentData = firestore.collection(`organizations`);
  const document = configCollection.doc(`${organizationName}/cache/${key}`);

  // by default brotliDecompress returns a callback
  // which breaks the awaited order : the callabck is called after an undefined Promise has resolved
  const asyncDecompress = promisify(brotliDecompress);

  try {
    const snap: DocumentSnapshot<ICachedContent> = await document.get();
    const data = snap.data();
    if (data?.content) {
      const uncompressed = await asyncDecompress(Buffer.from(data.content, 'base64'));
      if (uncompressed) {
        return Promise.resolve({
          content: uncompressed.toString(),
          updateTime: snap.updateTime?.toDate()
        });
      } else {
        logger.error('undefined cached content');
        return Promise.resolve(undefined);
      }
    } else {
      return Promise.resolve(undefined);
    }
  } catch (error) {
    logger.error(error);
    return Promise.reject(error);
  }
};

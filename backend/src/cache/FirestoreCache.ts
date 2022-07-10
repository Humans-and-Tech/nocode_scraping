import { brotliCompress, brotliDecompress } from 'zlib';
import { Buffer } from 'buffer';
import { promisify } from 'util';

import {ICachedContent, CachedContent} from '../models/db';
import { upsert, get } from '../database';
import logger from '../logging';
import { Organization } from 'src/models/auth';

const config = require('config');


export class FirestoreCache {

    /**
     * stores brorli compressed (HTML) content, encoded in base64,
     * into Firestore under the key `${organizationName}/cache/${key}`
     *
     * @param key
     * @param content
     * @returns
     */
    async cachePageContent (key: string, organization: Organization, content: string): Promise<boolean | undefined> {

        try {
            // const configCollection: DocumentData = firestore.collection(`organizations`);
            // const document = configCollection.doc(`${organizationName}/cache/${key}`);

            // compress the content and store it
            brotliCompress(Buffer.from(content), async function (err: Error | null, compressed: Buffer) {
                if (err) {
                    logger.error(err);
                    return Promise.reject(false);
                }
                try {
                    if (compressed) {
                        const data: ICachedContent = {
                            key: key,
                            content: compressed.toString('base64') 
                        };
                        await upsert<ICachedContent>(organization, data);
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
    async loadPageContentFromCache (key: string, organization: Organization): Promise<ICachedContent | undefined> {

        // by default brotliDecompress returns a callback
        // which breaks the awaited order : the callabck is called after an undefined Promise has resolved
        const asyncDecompress = promisify(brotliDecompress);

        try {
            const docName = `${organization.name}/cache/${key}`;
            const data = await get<CachedContent>(organization, CachedContent, docName);
            
            if (data?.content) {
                const uncompressed = await asyncDecompress(Buffer.from(data.content, 'base64'));
                if (uncompressed) {
                    return Promise.resolve({
                        key: key,
                        content: uncompressed.toString(),
                        updateTime: data.updateTime
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

}
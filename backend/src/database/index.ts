
import { Firestore, DocumentData, DocumentSnapshot } from '@google-cloud/firestore';
import { ScrapingConfig, Organization } from '../interfaces';

// Create a new client
// the authentication is done through the firestore-creds.json
// which is stored at the root of the project
// and the path of which is passed as env variable when launching node
const firestore = new Firestore();

interface FireStoreError {
    code: number;
    details: string;
    [field: string]: unknown;
}

function isFireStoreError(obj: any): obj is FireStoreError {
    // 👇️ check for type property
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
async function upsert(organization: Organization, data: any, document: any): Promise<boolean> {

    try {
        // values cannot be undefined
        // thus replace undefined by JSON.stringify({})
        await document.update(data);
        return Promise.resolve(false);
    } catch (error: unknown) {

        if (isFireStoreError(error) && error.code === 5) {
            // this is a document not found error
            await document.create({
                'proxy': data.websiteConfig.proxy || JSON.stringify({}),
                'pageType': data.pageType,
                'url': data.pageUrl,
            });
            return Promise.resolve(true);
        } else {
            console.error('Unhandled error', error);
            return Promise.reject(error);
        }
    }
}

/**
 * 
 * @param organization 
 * @param data 
 * @returns true if the document is created, false if updated
 */
export async function updateScrapingConfig(organization: Organization, data: ScrapingConfig): Promise<boolean> {

    const organizationName = 'test';

    const configCollection: DocumentData = firestore.collection(`organizations`);

    const document = configCollection.doc(`${organizationName}/spiders/${data.websiteConfig.name}`);;
    try {
        const b: boolean = await upsert(organization, data, document)
        return Promise.resolve(b);
    } catch (error: unknown) {
        return Promise.reject(error);
    }
}


/**
 * 
 * @param organization 
 * @param name 
 * @returns the document if it is found else null
 */
export async function getScrapingConfig(organization: Organization, name: string): Promise<ScrapingConfig | undefined> {

    const organizationName = 'test';

    const configCollection: DocumentData = firestore.collection(`organizations`);

    const document = configCollection.doc(`${organizationName}/spiders/${name}`);;

    try {
        const snap: DocumentSnapshot<ScrapingConfig> = await document.get();
        return Promise.resolve(snap.data());

    } catch (error: unknown) {

        if (isFireStoreError(error) && error.code === 5) {
            // this is a document not found error
            return Promise.resolve(undefined);
        } else {
            console.error('Unhandled error', error);
            return Promise.reject(error);
        }
    }

}
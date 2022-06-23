
import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';

import { Spider } from '../../interfaces/spider';
import { firestore, upsert, isFireStoreError } from '../../database'


module.exports = () => {

    /**
     * 
     * @param organization 
     * @param data 
     * @returns true if the document is created, false if updated
     */
    const updateSpider = async function (user: unknown, spider: Spider, callback: (resp: boolean) => void) {

        const organizationName = 'test';

        const configCollection: DocumentData = firestore.collection(`organizations`);
        const document = configCollection.doc(`${organizationName}/spiders/${spider.name}`);

        try {
            const b: boolean = await upsert({}, spider, document)
            callback(true);
        } catch (error: unknown) {
            console.log(error);
            callback(false);
        }
    }


    /**
     * 
     * @param organization 
     * @param name 
     * @returns the document if it is found else null
     */
    const getSpider = async function (user: unknown, name: string, callback: (resp: Spider | undefined) => void) {

        if (name === '') {
            return Promise.reject("spider name cannot be blank");
        }

        const organizationName = 'test';

        const configCollection: DocumentData = firestore.collection(`organizations`);

        const document = configCollection.doc(`${organizationName}/spiders/${name}`);

        try {
            const snap: DocumentSnapshot<Spider> = await document.get();
            callback(snap.data());

        } catch (error: unknown) {

            if (isFireStoreError(error) && error.code === 5) {
                // this is a document not found error
            } else {
                console.error('Unhandled error', error);
            }
            callback(undefined);
        }

    }

    return {
        getSpider,
        updateSpider
    }
}
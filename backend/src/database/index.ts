
import { Firestore } from '@google-cloud/firestore';

// Create a new client
// the authentication is done through the firestore-creds.json
// which is stored at the root of the project
// and the path of which is passed as env variable when launching node
const firestore = new Firestore();

export async function saveData() {

    const document = firestore.doc('scraping/test');
    // Update an existing document.
    await document.update({
        element: 'My first Firestore app',
    });
    console.log('Updated an existing document');
}
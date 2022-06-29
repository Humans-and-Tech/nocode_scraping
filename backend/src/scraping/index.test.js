
const { getContent } = require('./index');


describe("Testing input arguments", () => {


    const expectedObj = {
        message: 'invalid call',
        status: "error",
        selector: {
            path: undefined
        }
    };

    test('Dumb call with missing arguments', async () => {
        let thrownError;
        try {
            getContent();
        }
        catch (error) {
            thrownError = error;
        }
        expect(thrownError).toEqual(expectedObj);
    });

});


describe("Testing getContent selector validation", () => {
    // including popupSelector
});


describe("Testing cache", () => {

});


describe("Testing popupSelector click", () => {

});

describe("Testing content scraping", () => {

});
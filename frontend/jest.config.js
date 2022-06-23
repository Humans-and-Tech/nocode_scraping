// Objet synchrone
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    "setupFiles": [
        "./jest.setup.js"
    ],
};

module.exports = config;

// Ou fonction asynchrone
module.exports = async () => {
    return {
        verbose: true,
    };
};
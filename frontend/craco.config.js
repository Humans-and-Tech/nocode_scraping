const path = require("path");

module.exports = {
    plugins: [
        {
            plugin: require('craco-plugin-scoped-css'),
        }
    ],
    /**
     * /!\ pb between craco-plugin-scoped-css and webpack ?
     * cannot make scoping work when webpack is configured here...
     * see https://github.com/gaoxiaoliangz/react-scoped-css/issues/44
     */
    webpack: {
        configure: {
            mode: 'development',
            entry: "./src/index.tsx",
            devtool: 'source-map',
            resolve: {
                /**
                 * important to look-up for JSON files, because the locales are stored in JSON
                 */
                extensions: [".js", ".jsx", "ts", "tsx", ".json"],
            },
            output: {
                path: path.resolve(__dirname, "public"),
                filename: "app.js",
            },
            module: {
                /** "rules"
                 * use the ts-loader to transform tsx or ts files before adding it to the bundle. 
                 */
                rules: [
                    {
                        test: /\.(ts|tsx)$/, //kind of file extension this rule should look for and apply in test
                        exclude: /node_modules/, //folder to be excluded
                        use: "ts-loader", //loader which we are going to use
                    }
                ],
            },
        }
    }
}
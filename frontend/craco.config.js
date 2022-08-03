const path = require("path");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")

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
            // plugins: [
            //     new MiniCssExtractPlugin(),
            // ],
            module: {
                /** "rules"
                 * use the ts-loader to transform tsx or ts files before adding it to the bundle. 
                 */
                // rules: [
                //     {
                //         test: /\.css$/,
                //         use: [
                //             'style-loader', 'postcss-loader', MiniCssExtractPlugin.loader
                //         ],
                //         exclude: /\.css$/,
                //     },
                    
                // ],
            },
        }
    }
}
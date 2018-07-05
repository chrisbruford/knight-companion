var webpack = require('webpack');
var helpers = require('./helpers');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    target: 'electron-renderer',

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: { configFileName: helpers.root('src', 'tsconfig.json') }
                    }, 'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.scss$/,
                exclude: helpers.root('src', 'app'),
                use: [{
                    loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
                },
                {
                    loader: 'css-loader',
                    options: {
                        sourceMaps: true
                    }
                },
                {
                    loader: "resolve-url-loader"
                },
                {
                    loader: "sass-loader",
                    options: {
                        sourceMaps: true
                    }
                }]
            },
            {
                test: /\.scss$/,
                include: helpers.root('src', 'app'),
                use: [
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        )
    ]
}

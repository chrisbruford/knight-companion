const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const helpers = require('./helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
require('dotenv').config();

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/app.ts',
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    target: "electron-renderer",

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
                exclude: helpers.root('src','app'),
                use: [{
                    loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
                },
                {
                    loader: 'css-loader'
                }, 
                {
                    loader: "resolve-url-loader"
                },
                {
                    loader: "sass-loader", 
                    options: {
                        sourceMaps: true,
                        includePaths: [path.resolve(__dirname, '../src/assets/scss')]
                    }
                }]
            },
            {
                test: /\.scss$/,
                include: helpers.root('src','app'),
                use: [
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: [path.resolve(__dirname, '../src/assets/scss')]
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        // Workaround for angular/angular#11580
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),

        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),

        new CopyWebpackPlugin([
            {from: helpers.root('./src/index.js'),to: helpers.root('./dist/index.js')},
            {from: helpers.root('./package.json'),to: helpers.root('./dist/package.json')},
            {from: helpers.root('./dev-app-update.yml'),to: helpers.root('./dist/dev-app-update.yml')}
        ])
    ]
};

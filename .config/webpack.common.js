const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const helpers = require('./helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
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
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        }
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
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'resolve-url-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMaps: true,
                            includePaths: [path.resolve(__dirname, '../src/assets/scss')]
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                include: helpers.root('src', 'app'),
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
        new ForkTsCheckerWebpackPlugin({
            tsconfig: './src/tsconfig.json'
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),

        new CopyWebpackPlugin([
            { from: helpers.root('./src/index.js'), to: helpers.root('./dist/index.js') },
            { from: helpers.root('./package.json'), to: helpers.root('./dist/package.json') },
            { from: helpers.root('./dev-app-update.yml'), to: helpers.root('./dist/dev-app-update.yml') }
        ])
    ]
};

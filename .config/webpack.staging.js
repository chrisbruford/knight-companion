const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const ElectronConnectWebpackPlugin = require('electron-connect-webpack-plugin');
const path = require('path');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = true;
const ENV = process.env.NODE_ENV = process.env.ENV = 'development';

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root('dist'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        pathinfo: false
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify('development'),
                'API_ENDPOINT': JSON.stringify('https://knightsofkarma-staging.azurewebsites.net/api'),
                'EDDN_JOURNAL_ENDPOINT': JSON.stringify('https://eddn.edcd.io/schemas/journal/1/test'),
                'INARA_API_ENDPOINT': JSON.stringify('https://inara.cz/inapi/v1/')
            }
        }),

        new ElectronConnectWebpackPlugin({
            path: path.join(__dirname, "../dist"),
            logLevel: 0
        }),

        new AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname,'../src/tsconfig.json'),
            entryModule: path.resolve(__dirname, '../src/app/app.module#AppModule'),
            sourceMap: true,
            skipCodeGeneration: true
        })
    ]
});
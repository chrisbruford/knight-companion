const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const ElectronConnectWebpackPlugin = require('electron-connect-webpack-plugin');
const path = require('path');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
  output: {
    path: helpers.root('dist'),
    filename: '[name].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    
    new ExtractTextPlugin('[name].[hash].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'API_ENDPOINT': JSON.stringify('https://www.knightsofkarma.com/api'),
        'EDDN_JOURNAL_ENDPOINT': JSON.stringify('https://eddn.edcd.io/schemas/journal/1'),
        'INARA_API_ENDPOINT': JSON.stringify('https://inara.cz/inapi/v1/')
      }
    }),
    new webpack.LoaderOptionsPlugin({
      htmlLoader: {
        minimize: false // workaround for ng2
      }
    })
  ]
});

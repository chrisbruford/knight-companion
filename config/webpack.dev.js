const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const ElectronConnectWebpackPlugin = require('electron-connect-webpack-plugin');
const path = require('path');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/Dev/kok-app/dist/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new ElectronConnectWebpackPlugin({
        path: path.join(__dirname,"../src"),
        logLevel: 0
    })
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});

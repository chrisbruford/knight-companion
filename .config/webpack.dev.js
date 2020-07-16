const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const commonConfig = require("./webpack.common.js");
const helpers = require("./helpers");
const ElectronConnectWebpackPlugin = require("electron-connect-webpack-plugin");
const path = require("path");

process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = true;

module.exports = webpackMerge(commonConfig, {
  devtool: "cheap-module-eval-source-map",

  output: {
    path: helpers.root("dist"),
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),

    new webpack.DefinePlugin({
      "process.env": {
        ENV: JSON.stringify("development"),
        API_ENDPOINT: JSON.stringify("http://localhost:3000/api"),
        EDDN_JOURNAL_ENDPOINT: JSON.stringify(
          "https://eddn.edcd.io/schemas/journal/1/test"
        ),
        EDDN_COMMODITY_ENDPOINT: JSON.stringify(
          "https://eddn.edcd.io/schemas/commodity/3/test"
        ),
        INARA_API_ENDPOINT: JSON.stringify("https://inara.cz/inapi/v1/"),
      },
    }),

    new ElectronConnectWebpackPlugin({
      path: path.join(__dirname, "../dist"),
      logLevel: 0,
    }),
  ],

  devServer: {
    historyApiFallback: true,
    stats: "minimal",
  },
});

var webpack = require("webpack");
var helpers = require("./helpers");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");

const ENV = (process.env.ENV = process.env.NODE_ENV = "test");

module.exports = {
  devtool: "inline-source-map",
  target: "electron-renderer",

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              configFile: path.resolve(__dirname, "../src/tsconfig.json"),
            },
          },
          "angular2-template-loader",
        ],
      },
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: "file-loader?name=assets/[name].[hash].[ext]",
      },
      {
        test: /\.scss$/,
        exclude: helpers.root("src", "app"),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMaps: true,
            },
          },
          {
            loader: "resolve-url-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMaps: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        include: helpers.root("src", "app"),
        use: [
          {
            loader: "raw-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: "./src/tsconfig.json",
    }),

    new webpack.DefinePlugin({
      "process.env": {
        ENV: JSON.stringify("development"),
        API_ENDPOINT: JSON.stringify("http://localhost:3876/api"),
        EDDN_JOURNAL_ENDPOINT: JSON.stringify(
          "https://eddn.edcd.io/schemas/journal/1/test"
        ),
        EDDN_COMMODITY_ENDPOINT: JSON.stringify(
          "https://eddn.edcd.io/schemas/commodity/3/test"
        ),
        INARA_API_ENDPOINT: JSON.stringify("https://inara.cz/inapi/v1/"),
      },
    }),
  ],
};

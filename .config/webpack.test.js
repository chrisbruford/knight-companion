var webpack = require('webpack');
var helpers = require('./helpers');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

module.exports = {
    devtool: 'inline-source-map',
    target: 'electron-renderer',
    mode: 'development',

    resolve: {
        extensions: ['.ts', '.js']
    },
    watchOptions: {
        ignored: /node_modules/
    },

    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
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
        new MiniCssExtractPlugin({ filename: '[name].css' }),

        new webpack.optimize.ModuleConcatenationPlugin(),

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify('development'),
                'API_ENDPOINT': JSON.stringify('http://localhost:3876/api'),
                'EDDN_JOURNAL_ENDPOINT': JSON.stringify('https://eddn.edcd.io/schemas/journal/1/test'),
                'INARA_API_ENDPOINT': JSON.stringify('https://inara.cz/inapi/v1/')
            }
        }),

        new AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname,'../src/tsconfig.json'),
            entryModule: path.resolve(__dirname, '../src/app/app.module#AppModule'),
            sourceMap: true,
            skipCodeGeneration: true
        })
    ]
}

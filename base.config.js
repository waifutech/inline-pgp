/* eslint-disable import/no-commonjs */

const path = require('path')
const webpack = require('webpack')

module.exports = (_opts) => ({
    context: __dirname,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]-build.js',
    },
    entry: {
        popup: [
            'babel-polyfill',
            './app/popup.js',
        ],
        frame: [
            'babel-polyfill',
            './app/frame.js',
        ],
        content: [
            'babel-polyfill',
            './app/content.js',
        ],
        background: [
            'babel-polyfill',
            './app/background.js',
        ],
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
        alias: { lib: path.join(__dirname, 'lib') },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loaders: ['babel-loader'],
                include: [path.resolve(__dirname + '/app')],
            },
        ],
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        }),
    ],
})

// const path = require('path')
// const CleanPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
// const CompressionPlugin = require("compression-webpack-plugin")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (opts) => ({
    mode: 'production',
    output: {
        filename: './[name]-build.js',
        chunkFilename: '[name]-build.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {test: /\.css$/,
                loader: [
                    'style-loader',
                    'css-loader?sourceMap'
                ]
            },
            {
                test: /\.(scss|sass)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        `css-loader?minimize&sourceMap&modules&localIdentName=[name]__[local]__[hash:base64:5]&importLoaders=3`,
                        'postcss-loader?sourceMap=true',
                        'resolve-url-loader',
                        'sass-loader?sourceMap',
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: ['./app/vars.sass']
                            }
                        },
                    ]
                })
            },
        ]
    },

    optimization: {
        minimize: false,
        // minimizer: [new UglifyJsPlugin({
        //     uglifyOptions: {
        //         output: {
        //             ascii_only: true
        //         }
        //     }
        // })],
        namedModules: true,
    },

    plugins: ([
        // new CleanPlugin(
        //     path.join('dist'),
        //     { root: process.cwd() }
        // ),

        new ExtractTextPlugin({
            filename: "[name]-build.css",
            allChunks: true
        }),

        // new CompressionPlugin({
        //     test: /\.js$|\.css$/
        // }),
    ]).filter(p => !!p)
})

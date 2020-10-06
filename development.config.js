const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = (opts) => ({
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    output: {
        devtoolModuleFilenameTemplate: '[resourcePath]',
        devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
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
                loaders: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: {
                                localIdentName: '[name]__[local]__[hash:base64:5]',
                            },
                            importLoaders: true,
                            url: false,
                        }
                    },
                    'resolve-url-loader',
                    'sass-loader?sourceMap',
                    {
                        loader: 'sass-resources-loader',
                        options: {
                            resources: ['./app/vars.sass']
                        }
                    },
                ]
            },
        ]
    },
    plugins: ([
        new CleanWebpackPlugin({
            cleanBeforeEveryBuildPatterns: ['dist']
        }),
    ]).filter(p => !!p)
})

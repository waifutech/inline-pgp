const path = require('path')
const CleanPlugin = require('clean-webpack-plugin')

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
                    `css-loader?sourceMap&modules&localIdentName=[name]__[local]__[hash:base64:5]&importLoaders`,
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
        new CleanPlugin(
            path.join('dist'),
            { root: process.cwd() }
        ),
    ]).filter(p => !!p)
})

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]__[local]__[hash:base64:5]',
                            },
                            importLoaders: 3,
                            url: false,
                        }
                    },
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
            },
        ]
    },

    optimization: {
        minimize: false,
        namedModules: true,
    },

    plugins: ([
        new MiniCssExtractPlugin({
            filename: '[name]-build.css',
        }),
        // new CompressionPlugin({
        //     test: /\.js$|\.css$/
        // }),
    ]).filter(p => !!p)
})

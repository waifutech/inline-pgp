/* eslint-disable import/no-commonjs */

const { merge } = require('webpack-merge')

const env = process.env.NODE_ENV || 'development'

const options = {}

module.exports = merge(
    require('./base.config.js')(options),
    require(`./${env}.config.js`)(options),
)

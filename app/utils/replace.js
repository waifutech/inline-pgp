const isArray = require('lodash.isarray')
const isString = require('lodash.isstring')
const flatten = require('lodash.flatten')
const escapeRegExp = require('lodash.escaperegexp')

const replace = (str, rx, replaceFn) => {
    let chunks = []

    rx.lastIndex = 0
    let lastStart = 0
    let match

    while (match = rx.exec(str)) {
        chunks.push(str.slice(lastStart, match.index))
        const original = match[0]
        chunks.push(replaceFn(original, match))
        lastStart = rx.lastIndex
    }

    chunks.push(str.slice(lastStart, str.length))

    return chunks
}

const arrayFriendlyReplace = (input, rx, replaceFn) => {
    if(isString(rx))
        rx = new RegExp(`(${escapeRegExp(rx)})`, 'gi')
    input = isArray(input) ? input : [input]
    return flatten(input.map(str => isString(str) ? replace(str, rx, replaceFn) : str))
}

module.exports = arrayFriendlyReplace
import escapeRegExp from 'lodash.escaperegexp'
import flatten from 'lodash.flatten'
import isArray from 'lodash.isarray'
import isString from 'lodash.isstring'

const replace = (str, rx, replaceFn) => {
    const chunks = []

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
    if (isString(rx)) { rx = new RegExp(`(${escapeRegExp(rx)})`, 'gi') }
    input = isArray(input) ? input : [input]

    return flatten(input.map(str => isString(str) ? replace(str, rx, replaceFn) : str))
}

export default arrayFriendlyReplace

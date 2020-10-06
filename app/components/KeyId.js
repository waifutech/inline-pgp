const React = require('react')
const useKey = require('../utils/useKey')

const KeyIdView = require('./KeyIdView')

const KeyId = ({children, ...rest}) => {
    const key = useKey(children)

    return (
        <KeyIdView {...{ ...key, ...rest }} />
    )
}

module.exports = KeyId

import React from 'react'

import KeyIdView from './KeyIdView'

import useKey from '../utils/useKey'


const KeyId = ({ children, ...rest }) => {
    const key = useKey(children)

    return (
        <KeyIdView {...{ ...key, ...rest }} />
    )
}

export default KeyId

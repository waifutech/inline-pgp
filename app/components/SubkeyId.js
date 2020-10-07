import React from 'react'

import KeyIdView from './KeyIdView'

import useKey from '../utils/useKey'


const SubkeyId = ({ children, displayInfo, ...rest }) => {
    const { id, subkeyId, info } = useKey(children)

    return (
        <div style={{ display: 'inline-block' }} title={!displayInfo ? '' + info : undefined} {...rest}>
            <span>
                <KeyIdView.Compact>{id}</KeyIdView.Compact>
                {subkeyId && <span style={{ margin: '0 .25em' }}>/</span>}
                {subkeyId && <KeyIdView.Compact title='Subkey'>{subkeyId}</KeyIdView.Compact>}
                {displayInfo && <span style={{ marginLeft: '.5em' }}> – {info}</span>}
            </span>
        </div>
    )
}

export default SubkeyId

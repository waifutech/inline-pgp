import copy from 'copy-to-clipboard'
import React from 'react'

import style from './key.sass'
import KeyId from './KeyId'
import IconButton from './ui/IconButton'
import toast from './ui/Toast'

import bem from '../utils/bem'

const c = bem(style)('key')

const Key = ({
    key_: { id, public_ },
    onDelete, onClick, ...rest
}) => {
    return (
        <div
            key={id} className={c()} onClick={ev => {
                if (!(ev.target.closest('button') || ev.target.closest('a') || !!getSelection().toString())) {
                    onClick(ev)
                }
            }} {...rest}
        >
            <div style={{ display: 'flex' }}>
                <div style={{ maxWidth: '400px' }}><KeyId>{'' + id}</KeyId></div>
                <IconButton
                    title='Copy public key to clipboard' onClick={() => {
                        copy(public_)
                        toast('Copied public key')
                    }} style={{ marginLeft: '6px', alignSelf: 'flex-end' }}
                >file_copy
                </IconButton>
            </div>
            <div><IconButton onClick={onDelete} title='Delete'>delete</IconButton></div>
        </div>
    )
}

export default Key

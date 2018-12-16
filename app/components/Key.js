const React = require('react')
const copy = require('copy-to-clipboard')

const Id = require('./ui/Id')
const toast = require('./ui/Toast')
const {'default': IconButton} = require('./ui/IconButton')

const {'default': bem} = require('../utils/bem')
const style = require('./key.sass')

const c = bem(style)('key')

const Key = ({
                 key_: {id, private_, public_,addedAt, createdAt},
                 onDelete, onClick, ...rest}) => {
    return (
        <div key={id} className={c()} onClick={ev => {
            if(!(ev.target.closest('button') || ev.target.closest('a') || !!getSelection().toString())) {
                onClick(ev)
            }

        }} {...rest}>
            <div style={{display: 'flex'}}>
                <div style={{maxWidth: '400px'}}><Id>{'' + id}</Id></div>
                <IconButton title={'Copy public key to clipboard'} onClick={() => {
                    copy(public_)
                    toast('Copied public key')
                }} style={{marginLeft: '6px', alignSelf: 'flex-end'}}>file_copy</IconButton>
            </div>
            <div><IconButton onClick={onDelete} title={'Delete'}>delete</IconButton></div>
        </div>
    )
}

module.exports = Key

const React = require('react')
const {'default': Blockies} = require('react-blockies')

const {'default': bem} = require('../utils/bem')

const PrivateKey = require('../svg/PrivateKey.svg')
const PublicKey = require('../svg/PublicKey.svg')
const style = require('./keyId.sass')

const c = bem(style)('id')

const KeyIdCompact = ({children: id, style, ...props}) => (
    <span {...props} style={{fontSize: '12px', ...style}}>
        <span style={{marginRight: '.25em', position: 'relative', top: '3px'}}>
            <Blockies size={8} scale={2} seed={''+id}/>
        </span>
        <span className={c('id')}>{id}</span>
    </span>
)

const KeyId = ({id, subkeyId, hasPrivate, warn = null, expires = null, fingerprint = null, users = [], ...rest}) => {
    let expired = false
    if(!!expires) {
        expired = expires < new Date().getTime()
        expires = new Date(expires)
    }

    fingerprint = fingerprint && fingerprint.match(/.{4}/g).join(' ')

    return (
        <div title={warn} className={c({warn})} {...rest}>
            <div className={c('icon')}>
                <Blockies size={8} scale={5} seed={''+id} />
            </div>
            <div className={c('info')}>
                <div className={c('id')}>
                    <span><span title={fingerprint}>{''+id}</span> {expired && <span title={''+expires} className={c('status')}>expired</span>}</span>
                    {subkeyId && (
                        <span style={{fontSize: '10px'}} title={'Subkey'}>
                            <span style={{margin: '0 .25em'}}>/</span>
                            <KeyIdCompact style={{position: 'relative', /*top: '4px',*/ margin: '0 .25em'}}>{subkeyId}</KeyIdCompact>
                            </span>
                    )}
                </div>
                <div
                    title={users.join('\n')}
                    style={{fontSize: '12px'}}
                >
                    <div title={hasPrivate ? 'Key pair' : 'Public key'} style={{display: 'inline-block', marginRight: '4px'}}>
                        {hasPrivate
                            ? <PrivateKey size={16} style={{verticalAlign: 'text-bottom', transform: 'scale(1.1)'}}  />
                            : <PublicKey size={16} style={{verticalAlign: 'text-bottom', transform: 'scale(.9)'}}/>
                        }
                    </div>
                    {users[0]
                        ? <span className={c('users')}>{users[0]} {users[1] ? <span style={{color: 'grey'}}>+{users.length-1} user(s)</span> : ''}</span>
                        : <span className={c('users', {unknown: true})}>Unknown user</span>
                    }
                </div>
            </div>
        </div>)
}

KeyId.Compact = KeyIdCompact

module.exports = KeyId

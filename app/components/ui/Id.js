const React = require('react')
const {'default': Blockies} = require('react-blockies')

const Keyring = require('../../Keyring')
const Storage = require('../../Storage')
const {'default': bem} = require('../../utils/bem')

const PrivateKey = require('../../svg/PrivateKey.svg')
const PublicKey = require('../../svg/PublicKey.svg')
const style = require('./id.sass')

const c = bem(style)('id')

const keys = () => Keyring.instance()

const IdSmall = ({children: id, style, ...props}) => (
    <span {...props} style={{fontSize: '12px', ...style}}>
        <span style={{marginRight: '.25em', position: 'relative', top: '3px'}}><Blockies size={8} scale={2} seed={''+id}/></span>
        <span className={c('id')}>{id}</span>
    </span>
)

const Id = ({id, subkeyId, hasPrivate, warn = null, expires = null, fingerprint = null, users = [], ...rest}) => {
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
                            <IdSmall style={{position: 'relative', /*top: '4px',*/ margin: '0 .25em'}}>{subkeyId}</IdSmall>
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

class IdSmallContainer extends React.Component {
    constructor(props) {
        super(props)
        this._update = this.update.bind(this)
        Storage.keys().subscribeChange(this._update)
        this.state = {}
    }

    componentWillUnmount() {
        Storage.keys().unsubscribeChange(this._update)
    }

    componentDidMount() {
        this.update()
    }

    //TODO dry
    update() {
        const {children: id} = this.props

        const key = keys().byId(id)
        const master = keys().bySubkeyId(id)

        let keyId, subkeyId
        !!master ? (subkeyId = id, keyId = master.id) : (subkeyId = null, keyId = id)

        const foundKey = key || master
        const hasKey = !!foundKey

        let info = ''

        if(hasKey) {
            info = foundKey.info
        }

        this.setState({keyId, subkeyId, hasKey, info})
    }

    render() {
        const {children, displayInfo, ...rest} = this.props
        const {keyId, subkeyId, info} = this.state

        return (
            <div style={{display: 'inline-block'}} title={!displayInfo ? ''+info : undefined} {...rest}>
                <span>
                    <IdSmall>{keyId}</IdSmall>
                    {subkeyId && <span style={{margin: '0 .25em'}}>/</span>}
                    {subkeyId && <IdSmall title={'Subkey'} style={{verticalAlign: 'middle'}}>{subkeyId}</IdSmall>}
                    {displayInfo && <span style={{marginLeft: '.5em'}}> – {info}</span>}
                </span>
            </div>
        )
    }
}

IdSmallContainer.Cmp = IdSmall

class IdContainer extends React.Component {
    constructor(props) {
        super(props)
        this._update = this.update.bind(this)
        Storage.keys().subscribeChange(this._update)
        this.state = {}
    }

    componentWillUnmount() {
        Storage.keys().unsubscribeChange(this._update)
    }

    async componentDidMount() {
        this.update()
    }

    update() {
        let {children: id, users: propsUsers, hasPrivate} = this.props
        let {public_, private_, users, expires, fingerprint}  = keys().byId(id) || {}

        let subkeyId = null

        if(!public_) {
            const master = keys().bySubkeyId(id) || {}
            if(!!master.public_) {
                subkeyId = id
                ;({id, public_, private_, users, expires, fingerprint} = master)
            }
        }

        users = users || propsUsers
        hasPrivate = hasPrivate || !!private_

        if(!public_)
            return this.setState({id, inited: true})

        this.setState({id, users, hasPrivate, subkeyId, expires, fingerprint, inited: true})
    }

    render() {
        const {id, users, inited, hasPrivate, subkeyId: sks, expires, fingerprint} = this.state || {}
        const {subkeyId, v, ...rest} = this.props

        if(!inited) return <div />

        return <Id {...{id, subkeyId: sks || subkeyId, users, hasPrivate, expires, fingerprint, ...rest}} />
    }
}

IdContainer.Small = IdSmallContainer

module.exports = IdContainer
const React = require('react')
const urlRx = require('url-regex')
const dataUriRx = require('data-uri-regex')

const Id = require('./ui/Id')
const Textarea = require('./ui/Textarea')
const Link = require('./ui/Link')
const {'default': Section} = require('./ui/Section')
const toast = require('./ui/Toast')
const ContentKey = require('./ContentKey')
const Passwords = require('./Passwords')
const replace = require('../utils/replace')
const {'default': bem} = require('../utils/bem')

const KeyStorage = require('../Keyring')
const Storage = require('../Storage')
const DecryptMessage = require('../DecryptMessage')
const {replacePgpMessages, replacePgpPublicKeys, replacePgpPrivateKeys} = require('../utils/replacePgp')

const style = require('./inline.sass')
const Spinner = require('../svg/Spinner.svg')

const c = bem(style)('inline')

const replaceNewLines = (input) => replace(input, '\n', (original, match) => <br key={match.index}/>)

const replaceWithLinks = (input, rx) => replace(input, rx, (original, match) =>
    <a href={original} key={match.index} target="_blank" rel="nofollow noopener">{original}</a>
)

const replacePgpStuff = (text) => {
    text = replacePgpMessages(text, (original, match) => <ContentMessage key={match.index} messageBlock={original} />)
    text = replacePgpPrivateKeys(text, (original, match) => <ContentKey key={match.index} keyBlock={original} />)
    text = replacePgpPublicKeys(text, (original, match) => <ContentKey key={match.index} keyBlock={original} />)

    return text
}

module.exports = class ContentMessage extends React.Component {
    constructor() {
        super()
        this.state = {raw: false, inited: false, hasKey: false}
    }

    async componentDidMount() {
        const {messageBlock} = this.props
        this._decrypt = new DecryptMessage(messageBlock)
        this._check = this.check.bind(this)
        Storage.session().subscribeChange(this._check)
        Storage.keys().subscribeChange(this._check)
        // window.onfocus = this._check

        await this.decrypt()
    }

    componentWillUnmount() {
        Storage.session().unsubscribeChange(this._check)
        Storage.keys().unsubscribeChange(this._check)
    }

    check() {
        const {plaintext} = this.state
        if(!plaintext)
            this.decrypt()
    }

    async decrypt() {
        let keyId, hasKey = false

        try {
            keyId = this._decrypt.getKeyId()
            const key = await this._decrypt.pickKey()
            hasKey = !!key

            if(hasKey && !!key.private_) {
                await Passwords.ensurePassword(key.id, {dialog: 'small'})
                await Passwords.close()
            }

            let {signatures, data: plaintext} = await this._decrypt.perform()

            signatures = signatures.map(({keyid, valid}) => ({id: KeyStorage.formatId(keyid), valid}))

            if(!!plaintext)
                return this.setState({plaintext, signatures})
        } catch(err) {
            toast(err.message)
            console.error(err)
            this.setState({err})
        } finally {
            this.setState({keyId, hasKey, inited: true})
        }
    }

    render() {
        const {raw, plaintext, hasKey, inited, keyId, signatures} = this.state
        const {messageBlock: ciphertext} = this.props

        if(!inited) return <div className={'center'}><Spinner size={32}/></div>

        const decrypted = !!plaintext

        return (<div className={c({err: !decrypted, ok: decrypted})}>
            <div>
                <div className={c('actions')}>
                    <Link disabled={!raw} onClick={() => this.setState({raw: false})}><b>Decrypted</b></Link>
                    {' | '}
                    <Link disabled={raw} onClick={() => this.setState({raw: true})}><b>Raw</b></Link>
                </div>
                {signatures &&
                    <div title={'Signed'} style={{marginTop: '10px'}}>{([...signatures].map(({id, valid}) =>
                        <div key={id}>
                            <div style={{marginBottom: '5px', display: 'inline-block'}}>
                                <Id warn={!valid ? 'Invalid or unknown signature' : null}>{id}</Id>
                            </div>
                        </div>
                    ))}</div>
                }
            </div>

            <Section style={{margin: '10px 0'}}>
                {!raw
                    ? <div style={{
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        // wordBreak: 'break-all',
                        wordBreak: 'break-word',
                    }}>{decrypted
                        ? replaceNewLines(replaceWithLinks(replaceWithLinks(replacePgpStuff(plaintext), dataUriRx()), urlRx()))
                        : <div>{<span><i><span style={{color: 'grey'}}>Encrypted message</span> <a onClick={this.decrypt.bind(this)}>Decrypt</a></i></span>}</div>
                    }</div>
                    : <div>
                        <Textarea rows={8} copy code style={{width: '100%', resize: 'vertical'}}>{ciphertext}</Textarea>
                    </div>}
            </Section>
            <div title={'Encrypted'}><Id.Small>{keyId}</Id.Small></div>
        </div>)
    }
}

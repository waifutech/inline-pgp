const React = require('react')
const urlRx = require('url-regex')

const Id = require('./ui/Id')
const Image = require('./ui/Image')
const Textarea = require('./ui/Textarea')
const Icon = require('./ui/Icon')
const Link = require('./ui/Link')
const {'default': Section} = require('./ui/Section')
const toast = require('./ui/Toast')
const ContentKey = require('./ContentKey')
const Passwords = require('./Passwords')
const replace = require('../utils/replace')
const dataUriRx = require('../utils/dataUriRx')
const {'default': bem} = require('../utils/bem')

const KeyStorage = require('../Keyring')
const Storage = require('../Storage')
const DecryptMessage = require('../DecryptMessage')
const {replacePgpMessages, replacePgpPublicKeys, replacePgpPrivateKeys} = require('../utils/replacePgp')

const style = require('./inline-content.sass')
const Spinner = require('../svg/Spinner.svg')

const c = bem(style)('inline-content')
const p = bem(style)('preview')

const replaceNewLines = (input) => replace(input, '\n', (original, match) => <br key={match.index}/>)

const replaceWithLinks = (input, rx) => replace(input, rx, (original, match) =>
    <a href={original} key={'link-' + match.index} target="_blank" rel="nofollow noopener">{original}</a>
)

const replaceFiles = (input) => replace(input, dataUriRx(),(original, match) => {
    let filename = 'file'

    const contentType = match[2]

    const params = (match[3] || '')
        .split(';')
        .filter(p => !!p && p.includes('='))
        .map(p => p.split('='))
        .reduce((acc, next) => ({...acc, [next[0]]: decodeURI(next[1])}), {})

    filename = params.filename || filename

    const title = <span><Icon style={{color: 'black', position: 'relative', left: '-4px'}}>attach_file</Icon> {filename}</span>

    return <a download={filename} href={original} key={'file-' + match.index} target="_blank" title={'Download file'} rel="nofollow noopener">
        {contentType.startsWith('image/')
            ? (
                <div className={p()}>
                    <Image className={p('image')} inline src={original} size={'160px'} style={{marginBottom: '4px'}} />
                    {title}
                </div>
            ) : title
        }
    </a>
})

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
                        wordBreak: 'break-word',
                    }}>{decrypted
                        ? replaceNewLines(replaceWithLinks(replaceFiles(replacePgpStuff(plaintext)), urlRx()))
                        : <div>{<span><i><span style={{color: 'grey'}}>Encrypted message</span> <a onClick={this.decrypt.bind(this)}>Decrypt</a></i></span>}</div>
                    }</div>
                    : <div>
                        <Textarea rows={8} copy code style={{resize: 'vertical'}}>{ciphertext}</Textarea>
                    </div>}
            </Section>
            <div title={'Encrypted'}><Id.Small>{keyId}</Id.Small></div>
        </div>)
    }
}

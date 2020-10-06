const React = require('react')
const urlRx = require('url-regex')
const { useEffect, useState, useCallback, Fragment } = React

const KeyId = require('./KeyId')
const SubkeyId = require('./SubkeyId')
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

const replaceWithLinks = rx => input => replace(input, rx, (original, match) =>
    <a href={original} key={'link-' + match.index} target="_blank" rel="nofollow noopener">{original}</a>
)

const replaceUrls = replaceWithLinks(urlRx())

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
                    <Image className={p('image')} src={original} size={'160px'} style={{marginBottom: '4px'}} />
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

const ContentMessage = ({messageBlock: ciphertext}) => {
    const [plaintext, setPlaintext] = useState()
    const [signatures, setSignatures] = useState()
    const [keyId, setKeyId] = useState()
    const [inited, setInited] = useState(false)
    const [displayRaw, setDisplayRaw] = useState(false)
    const [error, setError] = useState()

    const decrypt = useCallback(async () => {
        let keyId, hasKey = false

        const decrypt = new DecryptMessage(ciphertext)

        try {
            keyId = await decrypt.getKeyId()
            const key = await decrypt.pickKey()
            hasKey = !!key

            if(hasKey && !!key.private_) {
                await Passwords.ensurePassword(key.id, {dialog: 'small'})
                await Passwords.close()
            }

            let {signatures, data: plaintext} = await decrypt.perform()

            if(!!plaintext) {
                const displayPlaintext = (
                    <Fragment>
                        {
                            plaintext
                                |> replacePgpStuff
                                |> replaceFiles
                                |> replaceUrls
                                |> replaceNewLines
                        }
                    </Fragment>
                )
                setPlaintext(displayPlaintext)
                signatures = signatures.map(({keyid, valid}) => ({id: KeyStorage.formatId(keyid), valid}))
                setSignatures(signatures)
            }
        } catch(err) {
            toast(err.message)
            console.error(err)
            setError(err)
        } finally {
            setInited(true)
            setKeyId(keyId)
        }
    }, [ciphertext])

    useEffect(() => {
        const check = () => !plaintext && decrypt()
        Storage.session().subscribeChange(check)
        Storage.keys().subscribeChange(check)
        // window.onfocus = this._check
        check()

        return () => {
            Storage.session().unsubscribeChange(check)
            Storage.keys().unsubscribeChange(check)
        }
    }, [decrypt])

    if(!inited) return <div className={'center'}><Spinner size={32}/></div>

    const decrypted = !!plaintext

    return (
        <div className={c({err: !decrypted, ok: decrypted})}>
            <div>
                <div className={c('actions')}>
                    <Link disabled={!displayRaw} onClick={() => setDisplayRaw(false)}><b>Decrypted</b></Link>
                    {' | '}
                    <Link disabled={displayRaw} onClick={() => setDisplayRaw(true)}><b>Raw</b></Link>
                </div>
                {signatures &&
                <div title={'Signed'} style={{marginTop: '10px'}}>{([...signatures].map(({id, valid}) =>
                    <div key={id}>
                        <div style={{marginBottom: '5px', display: 'inline-block'}}>
                            <KeyId warn={!valid ? 'Invalid or unknown signature' : null}>{id}</KeyId>
                        </div>
                    </div>
                ))}</div>
                }
            </div>

            <Section style={{margin: '10px 0'}}>
                {!displayRaw
                    ? <div style={{
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                    }}>{decrypted
                        ? plaintext
                        : (
                            <div><span><i>
                                <span style={{color: 'grey'}}>Encrypted message</span> <a onClick={decrypt}>Decrypt</a>
                            </i></span></div>
                        )
                    }</div>
                    : <div>
                        <Textarea rows={8} copy code style={{resize: 'vertical'}}>{ciphertext}</Textarea>
                    </div>}
            </Section>
            <div title={'Encrypted'}>
                <SubkeyId>{keyId}</SubkeyId>
            </div>
        </div>
    )
}

module.exports = ContentMessage

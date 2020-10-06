const pgp = require('../pgp')
const React = require('react')
const { useState, useEffect, useRef } = React

const KeyId = require('./KeyId')
const KeyIdView = require('./KeyIdView')
const {'default': Button} = require('./ui/Button')
const Grid = require('./ui/Grid')
const {'default': Section} = require('./ui/Section')
const Link = require('./ui/Link')
const KeyInfo = require('./KeyInfo')
const Textarea = require('./ui/Textarea')
const Keyring = require('../Keyring')
const Storage = require('../Storage')
const {'default': bem} = require('../utils/bem')

const style = require('./inline-content.sass')
const Spinner = require('../svg/Spinner.svg')

const c = bem(style)('inline-content')

const keys = () => Keyring.instance()

const ContentKey = ({keyBlock}) => {
    const [inited, setInited] = useState(false)
    const [error, setError] = useState(false)
    const [displayRaw, setDisplayRaw] = useState(false)
    const [v, setV] = useState(0)
    const keyRef = useRef()

    useEffect(() => {
        const refresh = () => setV(v + 1)
        ;(async () => {
            const read = await pgp.key.readArmored(keyBlock)
            const err = (read.err || [])[0]
            if(err) {
                console.error(err)
                setError(err)
                setInited(true)
                return
            }
            keyRef.current = read.keys[0]
            Storage.keys().subscribeChange(refresh)
            // window.onfocus = refresh
            setInited(true)
        })()
        return () => Storage.keys().unsubscribeChange(refresh)
    }, [keyBlock])

    if(!inited) return <div className={'center'}><Spinner size={32}/></div>
    if(error) return <div>{''+error}</div>

    const key = keyRef.current
    const id = Keyring.id(key)
    const isPrivate = key.isPrivate()
    const users = key.users.map(({userId: {userid}}) => userid)
    const stored = keys().byId(id)
    const hasPublic = !!stored
    const hasPrivate = hasPublic && !!stored.private_
    const hasKey = isPrivate ? hasPrivate : hasPublic

    return (
        <div className={c()}>
            <Grid n={1} padding={0}>
                <div>
                    <div>
                        <Link disabled={!displayRaw} onClick={() => setDisplayRaw(false)}><b>Key info</b></Link>
                        {' | '}
                        <Link disabled={displayRaw} onClick={() => setDisplayRaw(true)}><b>Raw</b></Link>
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

                <Section style={{margin: '10px 0'}}>
                    {displayRaw
                        ? <Textarea rows={8} copy code style={{width: '100%', resize: 'vertical'}}>{keyBlock}</Textarea>
                        : <KeyInfo key_={keyRef.current}>
                            <div>
                                <KeyId hasPrivate={isPrivate} users={users}>{id}</KeyId>
                                <div style={{marginBottom: '10px', marginTop: '5px'}}>{keyRef.current.subKeys.map(sk => (
                                    <KeyIdView.Compact key={id} style={{marginRight: '1em'}}>
                                        {sk.getKeyId().toHex()}
                                    </KeyIdView.Compact>
                                ))}</div>
                            </div>
                        </KeyInfo>}
                </Section>

                <div>
                    {hasKey
                        ? <Link style={{lineHeight: '40px', textTransform: 'uppercase'}} disabled={true}><b>Added to keyring</b></Link>
                        : <Button primary onClick={() => keys().add({[isPrivate ? 'private_' : 'public_']: keyBlock})}>Add to keyring</Button>}
                </div>
            </Grid>
        </div>
    )
}

module.exports = ContentKey

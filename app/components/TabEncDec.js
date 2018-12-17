const React = require('react')

const Keyring = require('../Keyring')
const Settings = require('../Settings')
const DecryptMessage = require('../DecryptMessage')
const EncryptMessage = require('../EncryptMessage')
const Grid = require('./ui/Grid')
const {'default': Section} = require('./ui/Section')
const Id = require('./ui/Id')
const Textarea = require('./ui/Textarea')
const {'default': Button} = require('./ui/Button')
const {'default': Tab} = require('./ui/Tab')
const toast = require('./ui/Toast')
const EncryptionSettings = require('./EncryptionSettings')
const wait = require('../utils/wait')

const keys = () => Keyring.instance()

class Encrypt extends React.Component {
    constructor() {
        super()
        const ks = keys()
        const signKey = (Settings.getCurrentSignKey() || {}).id
        this.state = {plaintext: '', encryptionKey: (Settings.getCurrentEncryptionKey() || {}).id, signKey, doSign: !!signKey}
    }

    async encrypt(ev) {
        ev.preventDefault()

        const {plaintext, encryptionKey, signKey, doSign} = this.state
        const ks = keys()

        this.setState({disabled: true}, async () => {
            await wait()
            try {
                const enc = new EncryptMessage(
                    plaintext,
                    ks.byId(encryptionKey),
                    doSign && signKey && ks.byId(signKey)
                )
                const ciphertext = await enc.perform()
                this.setState({ciphertext})
            } catch(err) {
                toast(err.message)
            } finally {
                this.setState({disabled: false})
            }
        })
    }

    render() {
        const {plaintext, ciphertext, disabled, encryptionKey, signKey, doSign} = this.state

        return (
            <form onSubmit={this.encrypt.bind(this)}>
                <Grid n={1}>
                    <Grid n={2}>
                        <Textarea
                            focus
                            required
                            placeholder={'Plain text'}
                            style={{resize: 'none', height: '380px'}}
                            rows={24}
                            onChange={plaintext => this.setState({plaintext})}
                            value={plaintext}
                        />
                        <Textarea
                            copy
                            placeholder={'Encrypted message'}
                            code
                            style={{resize: 'none', height: '380px'}}
                            rows={24}
                            value={ciphertext}
                        />
                    </Grid>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <EncryptionSettings style={{maxWidth: '80%'}} value={{encryptionKey, signKey, doSign}} onChange={v => this.setState(v)}/>
                        <Button primary outline disabled={disabled} loading={disabled} type={'submit'}>Encrypt</Button>
                    </div>
                </Grid>
            </form>
        )
    }
}


class Decrypt extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    async decrypt(ev) {
        ev.preventDefault()

        const {ciphertext} = this.state

        const decrypt = new DecryptMessage(ciphertext)

        this.setState({disabled: true}, async () => {
            let decryptedWith
            await wait()
            try {
                decryptedWith = decrypt.getKeyId()
                const {data: plaintext, signatures} = await decrypt.perform()
                this.setState({
                    plaintext,
                    signatures: signatures.map(({keyid, valid}) => ({id: Keyring.formatId(keyid), valid})),
                    decryptedWith
                })
            } catch(err) {
                // console.error(err)
                toast(err.message)
            } finally {
                this.setState({disabled: false, decryptedWith})
            }
        })
    }

    render() {
        const {ciphertext, plaintext, disabled, signatures = [], decryptedWith} = this.state

        return (
            <form onSubmit={this.decrypt.bind(this)}>
                <Grid n={1}>
                    <Grid n={2}>
                        <Textarea
                            focus
                            required
                            code
                            placeholder={'Encrypted message'}
                            style={{resize: 'none', height: '380px'}}
                            rows={24}
                            onChange={ciphertext => this.setState({ciphertext})} value={ciphertext}
                        />
                        <Textarea
                            copy
                            placeholder={'Decrypted message'}
                            style={{resize: 'none', height: '380px'}}
                            rows={24}
                            value={plaintext}
                        />
                    </Grid>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Grid n={!!signatures.length ? 2 : 1} style={{marginRight: '20px', maxWidth: '80%'}}>
                            {decryptedWith && (<div >
                                <label style={{marginBottom: '6px', display: 'inline-block'}}>Encryption key</label>
                                <Id>{decryptedWith}</Id>
                            </div>)}
                            {!!signatures.length && (<div>
                                <label style={{marginBottom: '6px', display: 'inline-block'}}>Signature</label>
                                <Grid n={1}>{[...signatures].map(({id, valid}) =>
                                    <div key={id}>
                                        <Id warn={!valid ? 'Invalid or unknown signature' : null}>{id}</Id>
                                    </div>)
                                }</Grid>
                            </div>)}
                        </Grid>
                        <Button primary style={{flexGrow: 0}} outline disabled={disabled} loading={disabled} type={'submit'}>Decrypt</Button>
                    </div>
                </Grid>
            </form>
        )
    }
}

module.exports = class EncDecTab extends React.Component {
    constructor() {
        super()
        this.state = {tab: 'ENC'}
    }

    render() {
        const {tab} = this.state

        return (
            <div>
                <div style={{marginBottom: '10px'}}>
                    <Tab active={tab === 'ENC'} onClick={() => this.setState({tab: 'ENC'})}>Encrypt</Tab>
                    <Tab active={tab === 'DEC'} onClick={() => this.setState({tab: 'DEC'})}>Decrypt</Tab>
                </div>
                <Section>
                    {tab === 'ENC' ? <Encrypt key={"ENC"}/> : <Decrypt key={"DEC"} />}
                </Section>
            </div>
        )
    }
}

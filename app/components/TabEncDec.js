import insertAtCursor from 'insert-text-at-cursor'
import React from 'react'

import EncryptionSettings from './EncryptionSettings'
import KeyId from './KeyId'
import Button from './ui/Button'
import FileInput from './ui/FileInput'
import Grid from './ui/Grid'
import Section from './ui/Section'
import Tab from './ui/Tab'
import Textarea from './ui/Textarea'
import toast from './ui/Toast'

import DecryptMessage from '../DecryptMessage'
import EncryptMessage from '../EncryptMessage'
import Keyring from '../Keyring'
import Settings from '../Settings'
import compactObject from '../utils/compactObject'
import dataUriRx from '../utils/dataUriRx'
import wait from '../utils/wait'

const keys = () => Keyring.instance()

class Encrypt extends React.Component {
    constructor() {
        super()
        const signKey = (Settings.getCurrentSignKey() || {}).id

        this.state = { encryptionKey: (Settings.getCurrentEncryptionKey() || {}).id, signKey, doSign: !!signKey }
    }

    async encrypt(ev) {
        ev.preventDefault()

        const { plaintext, onChange } = this.props
        const { encryptionKey, signKey, doSign } = this.state
        const ks = keys()

        this.setState({ disabled: true }, async () => {
            await wait()
            try {
                const enc = new EncryptMessage(
                    plaintext,
                    ks.byId(encryptionKey),
                    doSign && signKey && ks.byId(signKey),
                )
                const ciphertext = await enc.perform()

                onChange({ ciphertext })
            } catch (err) {
                console.error(err)
                toast(err.message)
            } finally {
                this.setState({ disabled: false })
            }
        })
    }

    render() {
        const { plaintext, ciphertext, onChange } = this.props
        const { disabled, encryptionKey, signKey, doSign } = this.state

        return (
            <form onSubmit={this.encrypt.bind(this)}>
                <Grid n={1}>
                    <Grid n={2}>
                        <Textarea
                            ref={ref => {
                                if (ref) { this._text = ref }
                            }}
                            focus
                            required
                            placeholder='Plain text'
                            style={{ resize: 'none', height: '350px' }}
                            rows={24}
                            onChange={plaintext => onChange({ plaintext })}
                            value={plaintext}
                        />
                        <Textarea
                            copy
                            placeholder='Encrypted message'
                            code
                            style={{ resize: 'none', height: '350px' }}
                            rows={24}
                            value={ciphertext}
                        />
                    </Grid>
                    <a><FileInput
                        multiple onUpload={f => {
                            const reader = new FileReader()

                            reader.readAsDataURL(f)
                            reader.onloadend = () =>
                                insertAtCursor(this._text._ref, ` ${dataUriRx.insertParameter(reader.result, 'filename', f.name)} `)
                        }}
                    >Add files (will be added as data urls)
                    </FileInput>
                    </a>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <EncryptionSettings style={{ maxWidth: '80%' }} value={{ encryptionKey, signKey, doSign }} onChange={v => this.setState(v)} />
                        <Button primary outline disabled={disabled} loading={disabled} type='submit'>Encrypt</Button>
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

        const { ciphertext, onChange } = this.props

        const decrypt = new DecryptMessage(ciphertext)

        this.setState({ disabled: true }, async () => {
            let decryptedWith

            try {
                decryptedWith = await decrypt.getKeyId()
                const { data: plaintext, signatures } = await decrypt.perform()

                onChange({ plaintext })
                this.setState({
                    signatures: signatures.map(({ keyid, valid }) => ({ id: Keyring.formatId(keyid), valid })),
                    decryptedWith,
                })
            } catch (err) {
                console.error(err)
                toast(err.message)
            } finally {
                this.setState({ disabled: false, decryptedWith })
            }
        })
    }

    render() {
        const { ciphertext, plaintext, onChange } = this.props
        const { disabled, signatures = [], decryptedWith } = this.state

        return (
            <form onSubmit={this.decrypt.bind(this)}>
                <Grid n={1}>
                    <Grid n={2}>
                        <Textarea
                            focus
                            required
                            code
                            placeholder='Encrypted message'
                            style={{ resize: 'none', height: '380px' }}
                            rows={24}
                            onChange={ciphertext => onChange({ ciphertext })} value={ciphertext}
                        />
                        <Textarea
                            copy
                            placeholder='Decrypted message'
                            style={{ resize: 'none', height: '380px' }}
                            rows={24}
                            value={plaintext}
                        />
                    </Grid>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Grid n={signatures.length ? 2 : 1} style={{ marginRight: '20px', maxWidth: '80%' }}>
                            {decryptedWith && (<div>
                                <label style={{ marginBottom: '6px', display: 'inline-block' }}>Encryption key</label>
                                <KeyId>{decryptedWith}</KeyId>
                            </div>)}
                            {!!signatures.length && (<div>
                                <label style={{ marginBottom: '6px', display: 'inline-block' }}>Signature</label>
                                <Grid n={1}>{[...signatures].map(({ id, valid }) =>
                                    <div key={id}>
                                        <KeyId warn={!valid ? 'Invalid or unknown signature' : null}>{id}</KeyId>
                                    </div>)}
                                </Grid>
                            </div>)}
                        </Grid>
                        <Button primary style={{ flexGrow: 0 }} outline disabled={disabled} loading={disabled} type='submit'>Decrypt</Button>
                    </div>
                </Grid>
            </form>
        )
    }
}

export default class EncDecTab extends React.Component {
    constructor() {
        super()
        this.state = { tab: 'ENC' }
    }

    render() {
        const { tab } = this.state
        const { encPlaintext, encCiphertext, decPlaintext, decCiphertext, onChange } = this.props

        return (
            <div>
                <div style={{ marginBottom: '10px' }}>
                    <Tab active={tab === 'ENC'} onClick={() => this.setState({ tab: 'ENC' })}>Encrypt</Tab>
                    <Tab active={tab === 'DEC'} onClick={() => this.setState({ tab: 'DEC' })}>Decrypt</Tab>
                </div>
                <Section>
                    {tab === 'ENC'
                        ? <Encrypt
                            key='ENC'
                            {...{ plaintext: encPlaintext, ciphertext: encCiphertext }}
                            onChange={({ plaintext, ciphertext }) => onChange(compactObject({ encPlaintext: plaintext, encCiphertext: ciphertext }))}
                        />
                        : <Decrypt
                            key='DEC'
                            {...{ plaintext: decPlaintext, ciphertext: decCiphertext }}
                            onChange={({ plaintext, ciphertext }) => onChange(compactObject({ decPlaintext: plaintext, decCiphertext: ciphertext }))}
                        />}
                </Section>
            </div>
        )
    }
}

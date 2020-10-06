const pgp = require('./pgp')
const KeyStorage = require('./Keyring')
const Passwords = require('./components/Passwords')

const {formatId} = KeyStorage
const keys = () => KeyStorage.instance()

module.exports = class DecryptMessage {
    constructor(ciphertext) {
        this.ciphertext = ciphertext
    }

    async perform() {
        const key = await this.pickKey()
        if(!key)
            throw new Error('Could not find a key for this message')
        return this.decryptWithKey(key)
    }

    async getPgpMessage() {
        if(!this._pgpMessage)
            this._pgpMessage = await pgp.message.readArmored(this.ciphertext)
        return this._pgpMessage
    }

    async getKeyId() {
        if(!this._keyId) {
            const message = await this.getPgpMessage()
            const id = ([...message.packets.map(p => p)].find(p => p.publicKeyId) || {}).publicKeyId
            this._keyId = formatId(id)
        }
        return this._keyId
    }

    async pickKey() {
        if(!this._key) {
            const keyId = await this.getKeyId(this.ciphertext)
            if(!keyId)
                throw new Error('Invalid message')
            this._key = keys().bySubkeyId(keyId)
        }
        return this._key
    }

    async decryptWithKey(key) {
        const {id: keyId, private_} = key

        if(!private_)
            throw new Error('No private key')

        const password = await Passwords.ensurePassword(keyId)

        if(!password)
            throw new Error('No password')

        const privateKeys = (await pgp.key.readArmored(private_)).keys
        await Promise.all(privateKeys.map(async k => await k.decrypt(password)))
        let message = await this.getPgpMessage()
        this.result = await pgp.decrypt({ message, privateKeys })
        const {signatures} = this.result

        if(!!signatures.length) {
            this._pgpMessage = null
            message = await this.getPgpMessage()
            const publicKeys = (await Promise.all(signatures.map(async ({keyid}) => {
                const id = KeyStorage.formatId(keyid)
                const k = keys().byId(id)
                return !!k ? (await pgp.key.readArmored(k.public_)).keys[0] : null
            }))).filter(v => !!v)

            this.result = await pgp.decrypt({ message, privateKeys, publicKeys })
        }

        this.result.decryptedWith = keyId

        return this.result
    }
}

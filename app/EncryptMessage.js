const pgp = require('./pgp')
const Passwords = require('./components/Passwords')


class EncryptMessage {
    constructor(plaintext, encrypt, sign) {
        this.plaintext = plaintext
        this.encrypt = encrypt
        this.sign = sign
    }

    async perform() {
        const {plaintext, encrypt, sign} = this

        const encryptionKey = (encrypt || {}).public_

        if(!encryptionKey)
            throw new Error('No encryption key provided')

        let data = {
            data: plaintext.toString(),
            publicKeys: pgp.key.readArmored(encryptionKey).keys,
        }

        if(!!sign) {
            const {id, private_: signKey} = (sign || {})

            const password = await Passwords.ensurePassword(id)

            if(!!signKey && !!password) {
                try {
                    const keys = await Promise.all(pgp.key.readArmored(signKey).keys.map(async k => {
                        await k.decrypt(password)
                        return k
                    }))

                    data = {
                        ...data,
                        privateKeys: keys
                    }
                } catch(err) {
                    console.error(err)
                }
            }
        }

        this.result = await pgp.encrypt(data)

        const {data: encrypted} = this.result

        return encrypted
    }
}

module.exports = EncryptMessage
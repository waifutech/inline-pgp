const escape = require('escape-html')

const replace = require('./replace')
const innertext = require('./innertext')
// const pgp = require('../pgp')

const fixBlock = (str) => {
    const ret = str
        .split('\n')
        .map(line => line.trim())
        .filter(line => !!line)
        .map((line, i, arr) => {
            if(i === 0)
                return line

            if(
                !arr[i].includes(':') &&
                (
                    arr[i-1].includes(':') || //last header
                    i === 1 //message without headers
                )
            )
                return '\n' + line

            return line
        })

    return escape(ret.join('\n'))
}

const validateBlock = async (str) => {
    return true
    // try {
    //     await pgp.message.readArmored(str)
    //     return true
    // } catch(err) {
    //     // console.log(err, str)
    //     return false
    // }
}

export const msgBlockRx = () => /-----BEGIN PGP MESSAGE-----.+?-----END PGP MESSAGE-----/gms
export const publicKeyBlockRx = () => /-----BEGIN PGP PUBLIC KEY BLOCK-----.+?-----END PGP PUBLIC KEY BLOCK-----/gms
export const privateKeyBlockRx = () => /-----BEGIN PGP PRIVATE KEY BLOCK-----.+?-----END PGP PRIVATE KEY BLOCK-----/gms

export const replacePgp = (rx, replaceFn) => (str) => replace(str, rx,(original, match) => {
    const block = fixBlock(innertext(original))
    return validateBlock(block) ? replaceFn(block, match) : original
})

export const replacePgpMessages = (str, replaceFn) => replacePgp(msgBlockRx(), replaceFn)(str)
export const replacePgpPublicKeys = (str, replaceFn) => replacePgp(publicKeyBlockRx(), replaceFn)(str)
export const replacePgpPrivateKeys = (str, replaceFn) => replacePgp(privateKeyBlockRx(), replaceFn)(str)

export default replacePgp

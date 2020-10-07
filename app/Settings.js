import matchWildcard from 'match-url-wildcard'

import cfg from './config'
import Storage from './Storage'

const filter = (lines) => (lines || '').split('\n').map(line => line.trim()).filter(line => !!line).join('\n')

class Settings {
    constructor() {
        this.init()
    }

    async init() {
        const ss = Storage.settings()

        await ss.init()
        if (!await ss.getData('initialized')) {
            await this.reset()
            await ss.setData('initialized', true)
        }
    }

    async reset() {
        await Storage.settings().clear()
        await this.setNotransform(cfg.notransform.join('\n'))
    }

    isDisabledForPage(pageUrl = document.location.href) {
        return this.isDisabled() || matchWildcard(pageUrl, this.getDisabledPages())
    }

    getNotransformForPage(pageUrl = document.location.href) {
        return this.getNotransform()
            .map(entry => {
                const [wildcard, ...rest] = entry.split(' ')

                return [wildcard, rest.join(' ')]
            })
            .filter(([wildcard]) => matchWildcard(pageUrl, wildcard))
            .map(([_, selector]) => selector)
            .filter(v => !!v)
    }

    isDisabled() {
        return !!Storage.settings().getData('disabled')
    }

    setDisabled(disabled) {
        return Storage.settings().setData('disabled', disabled)
    }

    setHideComments(hide) {
        return Storage.settings().setData('hideComments', hide)
    }

    getHideComments() {
        return Storage.settings().getData('hideComments')
    }

    setDisabledPages(disabledPages) {
        return Storage.settings().setData('disabledPages', filter(disabledPages))
    }

    getDisabledPages() {
        return (Storage.settings().getData('disabledPages') || '').split('\n')
    }

    setNotransform(notransform) {
        return Storage.settings().setData('notransform', filter(notransform))
    }

    getNotransform() {
        return (Storage.settings().getData('notransform') || '').split('\n')
    }

    getCurrentEncryptionKey() {
        return Storage.keys().getData(Storage.settings().getData('currentEncryptionKey'))
    }

    setCurrentEncryptionKey(id) {
        return Storage.settings().setData('currentEncryptionKey', id)
    }

    getCurrentSignKey() {
        return Storage.keys().getData(Storage.settings().getData('currentSignKey'))
    }

    setCurrentSignKey(id) {
        return Storage.settings().setData('currentSignKey', id)
    }
}

export default new Settings()

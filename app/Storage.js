import { v4 as uuid } from 'uuid'

const ls = chrome.storage.local
const cr = chrome.runtime
const lsget = async (key) => new Promise(resolve => ls.get([key], (r) => resolve(r[key])))
const lsset = async (key, value) => new Promise(resolve => ls.set({ [key]: value }, () => resolve(value)))

class Storage {
    static initAll() {
        return Promise.all([
            Storage.settings().init(),
            Storage.keys().init(),
            Storage.session().init(),
        ])
    }

    static session() {
        if (!Storage._session) { Storage._session = new Storage('SESSION') }

        return Storage._session
    }

    static settings() {
        if (!Storage._settings) { Storage._settings = new Storage('SETTINGS') }

        return Storage._settings
    }

    static keys() {
        if (!Storage._keys) { Storage._keys = new Storage('KEYS') }

        return Storage._keys
    }

    constructor(name) {
        this.name = name
        this.key = `storage-${name}`
        this.values = {}
        this.id = uuid()

        const handler = async ({ type }) => {
            if (type === `${this.name}_STORAGE_CHANGED`) {
                this.afterChange()
            }
        }

        cr.onMessage.addListener(handler)
        window.addEventListener('beforeunload', () => cr.onMessage.removeListener(handler))
    }

    async init() {
        if (!this._initPromise) {
            this._initPromise = this._load()
        }

        return this._initPromise
    }

    async clear() {
        this.values = {}
        await this._save()
    }

    async setData(key, data, dontsave) {
        this.values[key] = data

        return !dontsave && this._save()
    }

    getData(id) {
        return this.values[id]
    }

    del(id) {
        delete this.values[id]

        return this._save()
    }

    async _save() {
        await lsset(this.key, this.values)
        cr.sendMessage({
            type: `${this.name}_STORAGE_CHANGED`,
            redirect: false,
        })

        return await this.afterChange()
    }

    async _load() {
        this.values = await lsget(this.key) || {}

        return this
    }

    subscribeChange(callback) {
        if (!this._changeCallbacks) { this._changeCallbacks = [] }
        this._changeCallbacks = [...(this._changeCallbacks || []), callback].filter(cb => !!cb)
    }

    unsubscribeChange(callback) {
        this._changeCallbacks = [...(this._changeCallbacks || []), callback].filter(cb => cb !== callback)
    }

    async afterChange() {
        await this._load()
        this._changeCallbacks = (this._changeCallbacks || []).filter(cb => {
            try {
                cb()
            } catch (err) {
                console.error(err, cb)
            }

            return true
        })
    }
}

export default Storage

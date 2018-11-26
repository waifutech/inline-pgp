const orderBy = require('lodash.orderby')

const Storage = require('./Storage')

const pgp = require('./pgp')

module.exports = class Keyring {
    static instance() {
        if(!Keyring._instance)
            Keyring._instance = new Keyring()
        return Keyring._instance
    }

    constructor() {
        this.storage = Storage.keys()
    }

    async init(global) {
        await this.storage.init()
        global && await this._updateSearchIndex(true)
    }

    all() {
        return Object.values(this.storage.values).filter(v => v instanceof Object)
    }

    find(query, {'private': p} = {}) {
        let ret = this.all().filter(({private_}) => p ? !!private_ : true)

        if(!!query) {
            query = query.toLowerCase()
            ret = ret.filter(({search}) => search.toLowerCase().includes(query))
        }

        return orderBy(ret, [({addedAt}) => addedAt || '', ({createdAt}) => createdAt || ''], ['desc', 'desc'])
    }

    byId(id) {
        return this.storage.getData(id)
    }

    bySubkeyId(id) {
        //TODO index?
        return this.all().find(({subkeys}) => subkeys.find(skid => skid === id))
        // return this.all()
        //     .find(({public_}) => pgp.key.readArmored(public_).keys[0].subKeys
        //         .find(sk => sk.subKey.getKeyId().toHex() === id))
    }

    static id(key) {
        return Keyring.formatId(key.primaryKey.keyid)
    }

    static formatId(keyId) {
        return !!keyId ? keyId.toHex() : null
    }

    async add({private_, public_}) {
        const {keys, err} = pgp.key.readArmored(private_ || public_)

        if(err)
            throw err

        let added = 0

        const wait = keys.map(async k => {
            let public_, private_
            if(k.isPrivate()) {
                private_ = k.armor()
                public_ = k.toPublic().armor()
            } else {
                public_ = k.armor()
            }

            const id = Keyring.id(k)

            const found = this.storage.getData(id)

            if(!found || (!!private_ && !found.private_)) {
                this.storage.setData(id, {
                    private_,
                    public_,
                    id,
                    addedAt: new Date().getTime(),
                    ...await this._indexData({id, public_})
                }, true)
                added++
            }
        })

        await Promise.all(wait)

        if(!!added) {
            await this.storage._save()
        }


        return added
    }

    del(id) {
        return this.storage.del(id)
    }

    clear() {
        return this.storage.clear()
    }

    async generate({name, email, password, comment}) {
        const key = await pgp.generateKey({
            userIds: [{name, email, comment}],
            numBits: 4096,
            passphrase: password
        })

        return this.add({
            private_: key.privateKeyArmored,
            public_: key.publicKeyArmored,
        })
    }

    async _updateSearchIndex(reindex = false) {
        await Promise.all(this.all().map(async key => {

            if(!reindex && !!key.search)
                return

            this.storage.setData(key.id, {
                ...key,
                ...await this._indexData(key)
            }, true)
        }))

        return this.storage._save()
    }

    async _indexData({id, public_}) {
        const k = pgp.key.readArmored(public_).keys[0]

        const users = k.users.map(({userId: {userid}}) => userid)
        const info = users.join('\n')
        const {primaryKey: {created, fingerprint}, subKeys} = k
        let expires = await k.getExpirationTime()
        expires = isFinite(expires) ? expires.getTime() : null

        const search = `${id} ${info.split('\n').join(' ')}`

        return {
            search,
            createdAt: created.getTime(),
            expires,
            fingerprint: Buffer.from(fingerprint).toString('hex'),
            users,
            info,
            subkeys: subKeys.map(sk => sk.subKey.getKeyId().toHex())
        }
    }

    export_({private_: priv = true, public_: pub = true} = {}) {
        return this
            .find('')
            .map(({private_, public_}) => {
                const hasPrivate = !!private_

                if(hasPrivate && priv)
                    return private_

                if(pub)
                    return public_

                return null
            })
            .filter(v => !!v)
            .join('\n')
    }
}
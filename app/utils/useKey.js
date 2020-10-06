const React = require('react')
const { useState, useEffect } = React
const Keyring = require('../Keyring')
const Storage = require('../Storage')

const keys = () => Keyring.instance()

const useKey = (id) => {
    const [state, setState] = useState({})

    const lookup = () => {

        let { public_, private_, users, expires, fingerprint } = keys().byId(id) || {}

        let subkeyId = null

        if(!public_) {
            const master = keys().bySubkeyId(id) || {}
            if(!!master.public_) {
                subkeyId = id
                ;({ id, public_, private_, users, expires, fingerprint } = master)
            }
        }

        if(!public_)
            return setState({ id })

        setState({ id, users, hasPrivate: !!private_, subkeyId, expires, fingerprint })
    }

    useEffect(() => {
        Storage.keys().subscribeChange(lookup)
        lookup()
        return () => Storage.keys().unsubscribeChange(lookup)
    }, [id])

    return state
}

module.exports = useKey

import React from 'react'

const { useState, useEffect, useCallback } = React

import Keyring from '../Keyring'
import Storage from '../Storage'

const keys = () => Keyring.instance()

const useKey = (id) => {
    const [state, setState] = useState({})

    const lookup = useCallback(() => {
        let { public_, private_, users, expires, fingerprint } = keys().byId(id) || {}

        let subkeyId = null

        if (!public_) {
            const master = keys().bySubkeyId(id) || {}

            if (master.public_) {
                subkeyId = id
                /* eslint-disable-next-line react-hooks/exhaustive-deps */
                ;({ id, public_, private_, users, expires, fingerprint } = master)
            }
        }

        if (!public_) { return setState({ id }) }

        setState({ id, users, hasPrivate: !!private_, subkeyId, expires, fingerprint })
    }, [id])

    useEffect(() => {
        Storage.keys().subscribeChange(lookup)
        lookup()

        return () => Storage.keys().unsubscribeChange(lookup)
    }, [id, lookup])

    return state
}

export default useKey

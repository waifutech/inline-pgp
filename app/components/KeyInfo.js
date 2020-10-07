import React from 'react'

import style from './keyInfo.sass'
import Entry from './ui/Entry'
import Grid from './ui/Grid'

export default class KeyInfo extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    async componentDidMount() {
        const { key_ } = this.props
        let expires = await key_.getExpirationTime()

        if (!isFinite(expires)) { expires = null }
        this.setState({ expires })
    }

    render() {
        const { key_, children, ...rest } = this.props
        const k = key_.primaryKey || key_.subKey || key_
        const { expires } = this.state
        const { algorithm, bits } = k.getAlgorithmInfo()
        const created = k.getCreationTime()
        const fingerprint = k.getFingerprint()
        const expired = expires && (expires.getTime() < new Date().getTime())

        return (
            <Grid {...rest} n={1} padding={4}>
                {children}
                <Entry name='Algorithm: '>{algorithm}({bits})</Entry>
                <Entry name='Created: '>{'' + created}</Entry>
                <Entry name='Expires: '><span className={expired ? style.warn : style.ok}>{expires ? `${expired ? 'expired ' : ''}${expires}` : 'never'}</span></Entry>
                {fingerprint && <Entry name='Fingerprint: '>
                    <span style={{ fontFamily: 'monospace' }}> {fingerprint.match(/.{4}/g).join(' ')}</span>
                </Entry>}
            </Grid>
        )
    }
}

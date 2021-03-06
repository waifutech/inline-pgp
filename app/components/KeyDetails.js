import React, { useEffect, useState } from 'react'


import KeyId from './KeyId'
import KeyIdView from './KeyIdView'
import KeyInfo from './KeyInfo'
import Entry from './ui/Entry'
import Fade from './ui/Fade'
import Grid from './ui/Grid'
import Section from './ui/Section'
import Tab from './ui/Tab'
import Textarea from './ui/Textarea'

import pgp from '../pgp'

const KeyDetails = ({ id, private_, public_ }) => {
    const [showPrivate, setShowPrivate] = useState(false)
    const [key, setKey] = useState(null)

    useEffect(() => {
        (async () => setKey(await pgp.key.readArmored(public_)))()
    }, [public_])

    const hasPrivate = !!private_

    if (!key) { return <div /> }

    const k = key.keys[0]
    const { users, subKeys } = k

    return (
        <Grid n={1} padding={10}>
            <Section>
                <Grid n={1} padding={10}>
                    <div><KeyId>{id}</KeyId></div>

                    <KeyInfo key_={k} />

                    <Entry name='Users: '>
                        {users.map(u => (
                            <div key={'' + u.userId.userid}>
                                {'' + u.userId.userid}
                            </div>
                        ))}
                    </Entry>

                    <Entry name='Subkeys: '>
                        <Grid n={1} padding={6} style={{ marginTop: '6px' }}>
                            {subKeys.map(sk => <div key={sk.getKeyId().toHex()}>
                                <KeyInfo key_={sk}><KeyIdView.Compact>{sk.getKeyId().toHex()}</KeyIdView.Compact></KeyInfo>
                            </div>)}
                        </Grid>
                    </Entry>
                </Grid>
            </Section>

            <Section>
                <Grid n={1} padding={10}>
                    <div>
                        <Tab active={!showPrivate} onClick={() => setShowPrivate(false)}>Public</Tab>
                        {hasPrivate && <Tab active={showPrivate} onClick={() => setShowPrivate(true)}>Private</Tab>}
                    </div>
                    <Fade>
                        {!showPrivate && <Textarea key='public' copy code readOnly rows={12}>{public_}</Textarea>}
                        {showPrivate && <Textarea key='private' copy code readOnly rows={12}>{private_}</Textarea>}
                    </Fade>
                </Grid>
            </Section>
        </Grid>
    )
}

export default KeyDetails

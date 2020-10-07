import flatten from 'lodash.flatten'
import React from 'react'


import Button from './ui/Button'
import FileInput from './ui/FileInput'
import Grid from './ui/Grid'
import Section from './ui/Section'
import Textarea from './ui/Textarea'
import toast from './ui/Toast'

import pgp from '../pgp'
import { publicKeyBlockRx, privateKeyBlockRx } from '../utils/replacePgp'

export default class ImportForm extends React.Component {
    constructor() {
        super()
        this.state = { block: '' }
    }

    async parseKeys(source) {
        const parseWithRx = async (rx) => {
            let match, ret = []

            while (match = rx.exec(source)) {
                const { err, keys } = await pgp.key.readArmored(match[0])

                if (err) {
                    console.error(err)
                    toast(`Could not read pgp block: ${err}`)
                }

                keys.forEach(k => {
                    ret.push({ [k.isPrivate() ? 'private_' : 'public_']: k.armor() })
                })
            }

            return ret
        }

        return [publicKeyBlockRx(), privateKeyBlockRx()].map(parseWithRx) |> Promise.all |> await |> flatten
    }

    render() {
        const { block } = this.state
        const { onSubmit } = this.props

        return (
            <Section>
                <form onSubmit={async (ev) => {
                    ev.preventDefault()
                    onSubmit(await this.parseKeys(block))
                }}>
                    <fieldset>
                        <legend>Import keys</legend>
                        <Grid n={1} padding={10}>
                            <Textarea
                                code focus required rows={10}
                                placeholder={'PGP blocks'}
                                value={block}
                                onChange={block => this.setState({ block })}
                            />
                            <div>
                                <a style={{ float: 'left' }}><FileInput onUpload={f => {
                                    const reader = new FileReader()

                                    reader.onload = ev =>
                                        onSubmit(this.parseKeys(ev.target.result))
                                    reader.readAsText(f)
                                }}>Import from file</FileInput></a>

                                <Button primary type='submit' value={'Import'} style={{ float: 'right' }}/>
                                <div style={{ clear: 'both' }} />
                            </div>
                        </Grid>
                    </fieldset>
                </form>

            </Section>
        )
    }
}

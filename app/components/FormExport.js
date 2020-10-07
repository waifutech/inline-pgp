import downloadFile from 'js-file-download'
import React from 'react'

import Button from './ui/Button'
import Checkbox from './ui/Checkbox'
import Grid from './ui/Grid'
import Section from './ui/Section'
import toast from './ui/Toast'

import Keyring from '../Keyring'

const keys = () => Keyring.instance()

export default class FormExport extends React.Component {
    constructor() {
        super()
        this.state = { filename: 'keyring.asc', public_: true, private_: true }
    }

    doExport() {
        const { filename = 'keyring.asc', public_, private_ } = this.state

        downloadFile(keys().export_({ public_, private_ }), filename)
        toast('File saved')
    }

    render() {
        const { filename, public_, private_ } = this.state

        return (
            <Section>
                <form onSubmit={async (ev) => {
                    ev.preventDefault()
                    this.doExport()
                }}
                >
                    <fieldset>
                        <legend>Export keys</legend>
                        <Grid n={1} padding={0}>
                            <Grid padding={10}>
                                <label><Checkbox value={public_} onChange={public_ => this.setState({ public_ })} /> Public</label>
                                <label><Checkbox value={private_} onChange={private_ => this.setState({ private_ })} /> Private</label>
                            </Grid>
                            <div>
                                <label>
                                    <div style={{ marginBottom: '5px' }}>File name</div>
                                    <input required value={filename} placeholder='File name' onChange={ev => this.setState({ filename: ev.target.value })} />
                                </label>
                            </div>
                            <div>
                                <Button primary type='submit' value='Export' style={{ float: 'right' }} />
                                <div style={{ clear: 'both' }} />
                            </div>
                        </Grid>
                    </fieldset>
                </form>
            </Section>
        )
    }
}

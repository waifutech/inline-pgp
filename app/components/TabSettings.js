const React = require('react')

const Settings = require('../Settings')
const {'default': Section} = require('./ui/Section')
const {'default': Button} = require('./ui/Button')
const Textarea = require('./ui/Textarea')
const Field = require('./ui/Field')
const Grid = require('./ui/Grid')
const {'default': Checkbox} = require('./ui/Checkbox')
const toast = require('./ui/Toast')

const Storage = require('../Storage')

class TabSettings extends React.Component {
    constructor() {
        super()
        this.state = {v: 0}
    }

    componentDidMount() {
        this.load()
    }

    async load() {
        this.setState({
            notransform: Settings.getNotransform().join('\n'),
            disableOnPages: Settings.getDisabledPages().join('\n'),
        })
    }

    async save() {
        const {notransform, disableOnPages} = this.state

        await Settings.setDisabledPages(disableOnPages)
        await Settings.setNotransform(notransform)

        toast('Saved')

        await this.load()
    }

    refresh() {
        this.setState({v: ++this.state.v})
    }

    render() {
        const {notransform, disableOnPages} = this.state

        return (
            <Section>
                <Grid n={1}>
                    <Field>
                        <Field.Label>
                            <Checkbox
                                checked={!Settings.isDisabled()}
                                onChange={async disabled => {
                                    await Settings.setDisabled(!disabled)
                                    this.refresh()
                                }}
                            /> <span>Enabled</span>
                        </Field.Label>
                    </Field>
                    <Field>
                        <Field.Label>
                            <Checkbox
                                checked={!Settings.getHideComments()}
                                onChange={async hide => {
                                    await Settings.setHideComments(!hide)
                                    this.refresh()
                                }}
                            /> <span>Add comment and version headers to PGP blocks</span>
                        </Field.Label>
                    </Field>
                    <Field>
                        <Field.Label>Disable on pages <span style={{color: 'grey'}}>(supports url wildcrads, one per line)</span></Field.Label>
                        <Textarea
                            rows={8}
                            onChange={disableOnPages => this.setState({disableOnPages})}
                            value={disableOnPages}
                            onBlur={() => this.save()}
                        />
                    </Field>
                    {/*<Field>*/}
                        {/*<Field.Label>notransform</Field.Label>*/}
                        {/*<Textarea*/}
                            {/*rows={8}*/}
                            {/*onChange={notransform => this.setState({notransform})}*/}
                            {/*value={notransform}*/}
                            {/*onBlur={() => this.save()}*/}
                        {/*/>*/}
                    {/*</Field>*/}
                    <Field>
                        <Button primary onClick={() => {
                            if(confirm('Are you sure you want to delete stored passwords?')) {
                                Storage.session().clear()
                                toast('Stored passwords deleted')
                            }
                        }}>Delete stored passwords</Button>
                    </Field>
                    <Field>
                        <Button primary onClick={async () => {
                            if(confirm('Are you sure you want to reset settings?')) {
                                await Settings.reset()
                                this.refresh()
                                toast('Done')
                            }
                        }}>Reset settings</Button>
                    </Field>
                    <Field>
                        <Button dangerous primary onClick={() => {
                            if(confirm('Are you sure you want to delete all keys?')) {
                                Storage.keys().clear()
                                toast('All keys deleted')
                            }
                        }}>Delete all keys</Button>
                    </Field>
                </Grid>
            </Section>
        )
    }
}

module.exports = TabSettings

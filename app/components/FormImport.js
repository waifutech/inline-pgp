const React = require('react')
const flatten = require('lodash.flatten')

const pgp = require('../pgp')

const Grid = require('./ui/Grid')
const {'default': Section} = require('./ui/Section')
const {'default': Button} = require('./ui/Button')
const {'default': FileInput} = require('./ui/FileInput')
const Textarea = require('./ui/Textarea')
const toast = require('./ui/Toast')
const {publicKeyBlockRx, privateKeyBlockRx} = require('../utils/replacePgp')

module.exports = class ImportForm extends React.Component {
    constructor() {
        super()
        this.state = {block: ''}
    }

    async parseKeys(source) {
        const parseWithRx = async (rx) => {
            let match, ret = []

            while (match = rx.exec(source)) {
                const {err, keys} = await pgp.key.readArmored(match[0])

                if (err) {
                    console.log(err)
                    toast(`Could not read pgp block: ${err}`)
                }

                keys.forEach(k => {
                    ret.push({[k.isPrivate() ? 'private_' : 'public_']: k.armor()})
                })
            }

            return ret
        }

        return [publicKeyBlockRx(), privateKeyBlockRx()].map(parseWithRx) |> Promise.all |> await |> flatten
    }

    render() {
        const {block} = this.state
        const {onSubmit} = this.props

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
                                onChange={block => this.setState({block})}
                            />
                            <div>
                                <a style={{float: 'left'}}><FileInput onUpload={f => {
                                    const reader = new FileReader()
                                    reader.onload = ev =>
                                        onSubmit(this.parseKeys(ev.target.result))
                                    reader.readAsText(f)
                                }}>Import from file</FileInput></a>

                                <Button primary type='submit' value={'Import'} style={{float: 'right'}}/>
                                <div style={{clear: 'both'}} />
                            </div>
                        </Grid>
                    </fieldset>
                </form>

            </Section>
        )
    }
}

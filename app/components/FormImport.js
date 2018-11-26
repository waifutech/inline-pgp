const React = require('react')

const pgp = require('../pgp')

const Grid = require('./ui/Grid')
const {'default': Section} = require('./ui/Section')
const {'default': Button} = require('./ui/Button')
const Textarea = require('./ui/Textarea')
const toast = require('./ui/Toast')
const {publicKeyBlockRx, privateKeyBlockRx} = require('../utils/replacePgp')

module.exports = class ImportForm extends React.Component {
    constructor() {
        super()
        this.state = {block: ''}
    }

    parseKeys(source) {
        const parseWithRx = (rx) => {
            let match, ret = []

            while (match = rx.exec(source)) {
                const {err, keys} = pgp.key.readArmored(match[0])

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

        return [...parseWithRx(publicKeyBlockRx()), ...parseWithRx(privateKeyBlockRx())].reverse()
    }


    render() {
        const {block} = this.state
        const {onSubmit} = this.props

        return (
            <Section>
                <form onSubmit={async (ev) => {
                    ev.preventDefault()
                    onSubmit(this.parseKeys(block))
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
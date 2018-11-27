const React = require('react')
const pgp = require('../pgp')

const Id = require('./ui/Id')
const Textarea = require('./ui/Textarea')
const {'default': Section} = require('./ui/Section')
const {'default': Tab} = require('./ui/Tab')
const Grid = require('./ui/Grid')
const Fade = require('./ui/Fade')
const Entry = require('./ui/Entry')
const KeyInfo = require('./KeyInfo')

class KeyDetails  extends React.Component {
    constructor(props) {
        super(props)
        const {public_} = props
        this._key = pgp.key.readArmored(public_)
        this.state = {}
    }

    render() {
        const {private_, public_, id} = this.props
        const {showPrivate = false} = this.state
        const hasPrivate = !!private_

        const k = this._key.keys[0]
        const {users, subKeys} = k

        return (
            <Grid n={1} padding={10}>
                <Section>
                    <Grid n={1} padding={10}>
                        <div><Id>{id}</Id></div>

                        <KeyInfo key_={k} />

                        <Entry name={'Users: '}>
                            {users.map(u => (
                                <div key={''+u.userId.userid}>
                                    {''+u.userId.userid}
                                </div>
                            ))}
                        </Entry>

                        <Entry name={'Subkeys: '}>
                            <Grid n={1} padding={6} style={{marginTop: '6px'}}>
                                {subKeys.map(sk => <div key={sk.getKeyId().toHex()}>
                                    <KeyInfo key_={sk}><Id.Small.Cmp>{sk.getKeyId().toHex()}</Id.Small.Cmp></KeyInfo>
                                </div>)}
                            </Grid>
                        </Entry>
                    </Grid>
                </Section>

                <Section>
                    <Grid n={1} padding={10}>
                        <div>
                            <Tab active={!showPrivate} onClick={() => this.setState({showPrivate: false})}>Public</Tab>
                            {hasPrivate && <Tab active={showPrivate} onClick={() => this.setState({showPrivate: true})}>Private</Tab>}
                        </div>
                        <Fade>
                            {!showPrivate && <Textarea key={'public'} copy code readOnly rows={12}>{public_}</Textarea>}
                            {showPrivate && <Textarea key={'private'} copy code readOnly rows={12}>{private_}</Textarea>}
                        </Fade>
                    </Grid>
                </Section>
            </Grid>
        )
    }

}

module.exports = KeyDetails
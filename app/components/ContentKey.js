const pgp = require('../pgp')
const React = require('react')

const Id = require('./ui/Id')
const {'default': Button} = require('./ui/Button')
const Grid = require('./ui/Grid')
const {'default': Section} = require('./ui/Section')
const Link = require('./ui/Link')
const KeyInfo = require('./KeyInfo')
const Textarea = require('./ui/Textarea')
const Keyring = require('../Keyring')
const Storage = require('../Storage')
const {'default': bem} = require('../utils/bem')

const style = require('./inline.sass')
const Spinner = require('../svg/Spinner.svg')

const c = bem(style)('inline')

const keys = () => Keyring.instance()

module.exports = class ContentKey extends React.Component {
    constructor() {
        super()
        this.state = {inited: false, v: 0}
    }

    async componentDidMount() {
        const {keyBlock} = this.props

        const read = pgp.key.readArmored(keyBlock)

        const err = (read.err || [])[0]

        if(err) {
            console.log(err)
            this.setState({inited: true, err})
            return
        }

        this._key = read.keys[0]

        this._refresh = this.refresh.bind(this)
        Storage.keys().subscribeChange(this._refresh)
        // window.onfocus = this.refresh.bind(this)

        this.setState({inited: true, raw: false})
    }

    componentWillUnmount() {
        Storage.keys().unsubscribeChange(this._refresh)
    }

    refresh() {
        this.setState({v: this.state.v+1})
    }

    render() {
        const {keyBlock} = this.props
        const {inited, v, raw, err} = this.state

        if(!inited) return <div className={'center'}><Spinner size={32}/></div>
        if(err) return <div>{''+err}</div>

        const key = this._key
        const id = Keyring.id(key)
        const isPrivate = key.isPrivate()
        const users = key.users.map(({userId: {userid}}) => userid)
        const hasKey = !!keys().byId(id)

        return (<div className={c()}>
            <Grid n={1} padding={0}>
                <div>
                    <div>
                        <Link disabled={!raw} onClick={() => this.setState({raw: false})}><b>Key info</b></Link>
                        {' | '}
                        <Link disabled={raw} onClick={() => this.setState({raw: true})}><b>Raw</b></Link>
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

                <Section style={{margin: '10px 0'}}>
                    {raw
                        ? <Textarea rows={8} copy code style={{width: '100%', resize: 'vertical'}}>{keyBlock}</Textarea>
                        : <KeyInfo key_={this._key}>
                            <div>
                                <Id hasPrivate={isPrivate} users={users}>{id}</Id>
                                <div style={{marginBottom: '10px', marginTop: '5px'}}>{this._key.subKeys.map(sk => {
                                    const id = sk.getKeyId().toHex()
                                    return <Id.Small.Cmp key={id} style={{marginRight: '1em'}}>{id}</Id.Small.Cmp>
                                })}</div>
                            </div>
                        </KeyInfo>}
                </Section>

                <div>
                    {hasKey
                        ? <Link style={{lineHeight: '40px', textTransform: 'uppercase'}} disabled={true}><b>Added to keyring</b></Link>
                        : <Button primary onClick={() => keys().add({[isPrivate ? 'private_' : 'public_']: keyBlock})}>Add to keyring</Button>}
                </div>
            </Grid>
        </div>)
    }
}
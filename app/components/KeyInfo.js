const React = require('react')

const Grid = require('./ui/Grid')
const Entry = require('./ui/Entry')

const style = require('./keyInfo.sass')

module.exports = class KeyData extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    async componentDidMount() {
        const {key_} = this.props
        let expires = await key_.getExpirationTime()
        if(!isFinite(expires))
            expires = null
        this.setState({expires})
    }

    render() {
        const {key_, children, ...rest} = this.props
        const {algorithm, created, fingerprint, params} = key_.primaryKey || key_.subKey
        const {expires} = this.state

        const expired = expires && (expires.getTime() < new Date().getTime())

        return (
            <Grid {...rest} n={1} padding={4}>
                {children}
                <Entry name={'Algorithm: '}>{algorithm}({params && params[0] && params[0].data.byteLength * 8})</Entry>
                <Entry name={'Created: '}>{'' + created}</Entry>
                <Entry name={'Expires: '}><span className={expired ? style.warn : style.ok}>{expires ? `${expired ? 'Expired ' : ''}${expires}` : 'never'}</span></Entry>
                {fingerprint && <Entry name={'Fingerprint: '}>
                    <span style={{fontFamily: 'monospace'}}> {Buffer.from(fingerprint).toString('hex').match(/.{4}/g).join(' ')}</span>
                 </Entry>}
            </Grid>
        )
    }
}
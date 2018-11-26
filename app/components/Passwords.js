const React = require('react')
const cn = require('classnames')

const Storage = require('../Storage')
const KeyStorage = require('../Keyring')
const pgp = require('../pgp')

const PasswordInput = require('./PasswordInput')

const style = require('./passwords.sass')

const keys = () => KeyStorage.instance()

const getPassword = (id) => Storage.session().getData(`password_${id}`)
const storePassword = (id, password) => Storage.session().setData(`password_${id}`, password)

let passwords
let resolvePassword = null, rejectPassword = null

class Passwords extends React.Component {
    static close() {
        passwords.close()
    }

    static async requestPassword(id, options) {
        return passwords.requestPassword(id, options)
    }

    static async ensurePassword(id, options) {
        const stored = await getPassword(id)

        if(!!stored)
            return stored

        const requested = await this.requestPassword(id, options)
        await storePassword(id, requested)
        return requested
    }

    close() {
        return new Promise((resolve, reject) => this.setState({id: null}, () => resolve()))
    }

    async requestPassword(id, {dialog} = {}) {
        this.setState({id, dialog})
        return new Promise((resolve, reject) => {
            resolvePassword = resolve
            rejectPassword = reject
        })
    }

    constructor() {
        super()
        this.state = {}
    }

    componentDidMount() {
        passwords = this
    }

    async checkPassword(password) {
        const {id} = this.state
        const {private_} = keys().byId(id)

        this.setState({error: null}, async () => {
            try {
                await pgp.key.readArmored(private_).keys[0].decrypt(password)
                this.setState({id: null}, () => resolvePassword(password))
            } catch(err) {
                this.setState({error: err.message})
            }
        })
    }

    reject() {
        this.setState({id: null})
        rejectPassword()
    }

    render() {
        const {id, error, dialog} = this.state
        const small = dialog === 'small'

        return (
            <div>
                {!!id && <div>
                    <div className={style.backdrop} onClick={this.reject.bind(this)}/>
                    <div className={cn(style.window, small && style['window--small'])}>
                        <PasswordInput {...{id, small, error, onSubmit: this.checkPassword.bind(this), onCancel: this.reject.bind(this)}} />
                    </div>
                </div>}
            </div>
        )
    }
}

module.exports = Passwords
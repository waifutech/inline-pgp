import React from 'react'

import KeyId from './KeyId'
import Button from './ui/Button'
import Field from './ui/Field'
import Grid from './ui/Grid'

class PasswordInput extends React.Component {
    constructor() {
        super()
        this.state = { password: '' }
    }

    submit(ev) {
        ev.preventDefault()

        const { onSubmit } = this.props
        const { password } = this.state

        this.setState({ disabled: true }, () => {
            try {
                onSubmit(password)
            } finally {
                this.setState({ disabled: false })
            }
        })

        return false
    }

    componentDidMount() {
        this._input.focus()
    }

    render() {
        const { id, error, onCancel, small } = this.props
        const { password, disabled } = this.state

        return (
            <form onSubmit={this.submit.bind(this)}>
                <Grid n={1} padding={small ? 0 : 10}>
                    <KeyId style={small && { transform: 'scale(.8)', transformOrigin: 'top left' }}>{id}</KeyId>
                    <div style={{ display: 'flex' }}>
                        <Field error={error}>
                            <input
                                style={{ height: small ? '30px' : '40px' }}
                                onKeyDown={ev => {
                                    if ((ev.code || ev.keyCode) == 27) {
                                        ev.preventDefault()
                                        onCancel()
                                    }
                                }}
                                required
                                ref={ref => {
                                    this._input = ref
                                    ref && ref.focus()
                                }}
                                placeholder='Password'
                                type='password'
                                value={password}
                                onChange={({ target: { value: password } }) => this.setState({ password })}
                            />
                        </Field>
                        <Button primary disabled={disabled} type='submit' style={{ marginLeft: '10px', height: small ? '30px' : '40px' }}>Submit</Button>
                    </div>
                </Grid>
            </form>
        )
    }
}

export default PasswordInput

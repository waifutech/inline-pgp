import React from 'react'

import Button from './ui/Button'
import Grid from './ui/Grid'
import Input from './ui/Input'
import Section from './ui/Section'

export default class GenerateForm extends React.Component {
    constructor() {
        super()
        this.state = { name: '', email: '', password: '', password2: '', comment: '' }
    }

    validate() {
        const { email, password, password2 } = this.state

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Incorrect email format')

            return false
        }

        if (password2 !== password) {
            alert('Password and confirmation do not match')

            return false
        }

        return true
    }

    render() {
        const { name, email, password, password2, comment, disabled } = this.state
        const { onSubmit } = this.props

        return (
            <Section>
                <form onSubmit={async (ev) => {
                    ev.preventDefault()

                    if (this.validate()) {
                        this.setState({ disabled: true }, async () => {
                            try {
                                await onSubmit({ name, email, password, comment })
                            } catch (ex) {
                                console.error(ex)
                                alert('' + ex)
                            } finally {
                                this.setState({ disabled: false })
                            }
                        })
                    }
                }}
                >
                    <fieldset>
                        <legend>Generate a new key</legend>
                        <Grid n={1} padding={10}>
                            <Grid n={2} padding={10}>
                                <Input required value={name} placeholder='Name *' onChange={name => this.setState({ name })} />
                                <Input required type='email' value={email} placeholder='Email *' onChange={email => this.setState({ email })} />
                                <Input required value={password} type='password' placeholder='Password *' onChange={password => this.setState({ password })} />
                                <Input required value={password2} type='password' placeholder='Repeat password *' onChange={password2 => this.setState({ password2 })} />
                                <Input value={comment} placeholder='Comment' onChange={comment => this.setState({ comment })} />
                            </Grid>
                            <div>
                                <Button primary type='submit' disabled={disabled} loading={disabled} value='Generate' style={{ float: 'right' }} />
                                <div style={{ clear: 'both' }} />
                            </div>
                        </Grid>
                    </fieldset>
                </form>
            </Section>
        )
    }
}

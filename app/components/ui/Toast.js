import React from 'react'

import Fade from './Fade'
import style from './toast.sass'

let idSequence = 0
let container

const Toast = ({ children, ...rest }) => (
    <div>
        <div
            className={style.toast}
            {...rest}
        >{children}
        </div>
    </div>
)

class Container extends React.Component {
    constructor() {
        super()
        this.state = { toasts: [] }
    }

    componentDidMount() {
        container = this
    }

    addToast(toast, { timeout = 1000 } = {}) {
        const { clear } = this.props
        const { toasts } = this.state

        const id = ++idSequence

        this.setState({ toasts: [...(clear ? [] : toasts), { toast, id }] })

        setTimeout(() => this.setState({ toasts: this.state.toasts.filter(({ id: tid }) => tid !== id) }), timeout)
    }

    render() {
        const { top = '40px' } = this.props
        const { toasts } = this.state

        return (
            <Fade className={style.container} style={{ top }}>
                {toasts.map(({ id, toast }) => <Toast key={id}>{toast}</Toast>)}
            </Fade>
        )
    }
}

const ret = (toast, options) => container ? container.addToast(toast, options) : console.warn('No toast container')

ret.Container = Container

export default ret

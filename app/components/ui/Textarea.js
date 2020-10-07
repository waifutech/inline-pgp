import copy_ from 'copy-to-clipboard'
import React from 'react'

import IconButton from './IconButton'
import toast from './Toast'

class Textarea extends React.Component {
    componentDidMount() {
        const { focus } = this.props

        if (focus) { this._ref.focus() }
    }

    render() {
        const { children, onChange, copy, code, focus, style = {}, wrapperStyle = {}, ...rest } = this.props

        const readOnly = !onChange

        return (
            <div style={{ position: 'relative', ...wrapperStyle }}>
                <textarea
                    ref={r => {
                        if (r) { this._ref = r }
                    }} {...{ ...rest, style: { width: '100%', ...style, fontFamily: code ? 'monospace' : null }, readOnly, onChange: ev => onChange(ev.target.value, ev) }}
                >{children}
                </textarea>
                {copy && <IconButton
                    title='Copy to clipboard' style={{ position: 'absolute', top: '8px', right: '8px' }} onClick={() => {
                        if (!this._ref.value) { return }

                        copy_(this._ref.value)
                        toast('Copied')
                    }}
                >file_copy
                </IconButton>}
            </div>
        )
    }
}

export default Textarea

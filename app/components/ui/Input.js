import React from 'react'

export default class Input extends React.Component {
    componentDidMount() {
        this.focus()
    }

    focus() {
        const {focus} = this.props

        if(focus)
            setTimeout(() => this._ref.focus())
    }

    render() {
        let {value, onChange, number, type = 'text', style, focus, ...rest} = this.props

        return (
            <input
                ref={ref => {
                    if(!!ref)
                        this._ref = ref
                }}
                onFocus={(ev) => {
                    const target = ev.target
                    target.select()
                }}
                type={type}
                style={style}
                value={value}
                onChange={ev => onChange(ev.target.value, ev)}
                {...rest}
            />
        )
    }
}

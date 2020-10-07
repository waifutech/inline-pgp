import React from 'react'

const Checkbox = ({ value, onChange, style, ...rest }) => {
    return <input
        type='checkbox'
        checked={!!value}
        style={{
            position: 'relative',
            cursor: 'pointer',
            top: '2px',
            ...style,
        }}
        onClick={ev => onChange(!ev.target.checked, ev)}
        onChange={ev => onChange(!!ev.target.checked, ev)}
        {...rest}
    />
}

export default Checkbox

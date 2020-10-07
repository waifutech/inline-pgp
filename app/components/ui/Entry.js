import React from 'react'

const Entry = ({ name, children, ...rest }) => (
    <div {...rest}>
        <span style={{ fontWeight: 'bold' }}>{name}</span>
        {children}
    </div>
)

export default Entry

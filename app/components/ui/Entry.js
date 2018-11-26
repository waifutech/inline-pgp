const React = require('react')

const Entry = ({name, children, ...rest}) => (
    <div {...rest}>
        <span style={{fontWeight: 'bold'}}>{name}</span>
        {children}
    </div>
)

module.exports = Entry
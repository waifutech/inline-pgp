const React = require('react')
const cn = require('classnames')

const style = require('./icon.sass')

module.exports = ({className, children, ...rest}) => (<i className={cn(style.icon, 'material-icons', className)} {...rest}>{children}</i>)
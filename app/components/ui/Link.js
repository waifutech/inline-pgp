const React = require('react')

const Span = ({children, style, ...rest}) => <span {...rest} onClick={() => null} style={{...style, textDecoration: 'underline'}}>{children}</span>
const A = ({children, ...rest}) => <a {...{...rest}}>{children}</a>

const Link = ({disabled, children, style, onClick, ...rest}) => {
    const Wrap = disabled ? Span : A
    return <Wrap {...{onClick: disabled ? () => null : onClick, style: {...style, color: 'black'}, ...rest}}>{children}</Wrap>
}

module.exports = Link
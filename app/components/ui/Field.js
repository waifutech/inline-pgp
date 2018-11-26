const React = require('react')

const Fade = require('./Fade')

const style = require('./field.sass')

const Field = ({children, error, ...rest}) => (
    <div className={style.field} {...rest}>
        {children}
        <Fade>{error && <div className={style.field__error}>{error}</div>}</Fade>
    </div>
)

Field.Label = ({children, ...rest}) => <label {...rest} className={style.label}>{children}</label>

module.exports = Field
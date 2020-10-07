import React from 'react'

import Fade from './Fade'
import style from './field.sass'

const Field = ({ children, error, ...rest }) => (
    <div className={style.field} {...rest}>
        {children}
        <Fade>{error && <div className={style.field__error}>{error}</div>}</Fade>
    </div>
)

const Label = ({ children, ...rest }) => <label {...rest} className={style.label}>{children}</label>

Field.Label = Label

export default Field

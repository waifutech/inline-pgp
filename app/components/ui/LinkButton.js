import React from 'react'

import style from './linkButton.sass'

import bem from '../../utils/bem'

const c = bem(style)('link-button')

const LinkButton = ({ children, pressed, value, ...rest }) =>
    <a className={c({ pressed })} {...rest}>{children || value}</a>

export default LinkButton

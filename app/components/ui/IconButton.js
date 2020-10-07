import React from 'react'

import Icon from './Icon'
import style from './iconButton.sass'

import bem from '../../utils/bem'

const c = bem(style)('icon-button')

const IconButton = ({ children, pressed, value, type, ...rest }) =>
    <button
        className={c({ pressed })}
        {...{ ...rest, type: type || 'button' }}
    >
        <Icon className={c('icon')}>{children || value}</Icon>
    </button>

export default IconButton

import React from 'react'

import Icon from './Icon'

import bem from '../../utils/bem'
import style from './iconButton.sass'

const c = bem(style)('icon-button')

export default ({children, pressed, value, type, ...rest}) =>
    <button
        className={c({pressed})}
        {...{...rest, type: !!type ? type : 'button'}}
    >
        <Icon className={c('icon')}>{children || value}</Icon>
    </button>
import React from 'react'

import bem from '../../utils/bem'
import style from './linkButton.sass'

const c = bem(style)('link-button')

export default ({children, pressed, value, ...rest}) =>
    <a className={c({pressed})} {...rest}>{children || value}</a>
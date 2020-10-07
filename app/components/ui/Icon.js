import cn from 'classnames'
import React from 'react'

import style from './icon.sass'

const Icon = ({ className, children, ...rest }) => (<i className={cn(style.icon, 'material-icons', className)} {...rest}>{children}</i>)

export default Icon

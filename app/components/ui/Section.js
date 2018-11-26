const React = require('react')

import style from './section.sass'

export default ({children, ...rest}) => <div className={style.section} {...rest}>{children}</div>
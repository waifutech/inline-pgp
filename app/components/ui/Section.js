import React from 'react'

import style from './section.sass'


const Section = ({ children, ...rest }) => <div className={style.section} {...rest}>{children}</div>

export default Section

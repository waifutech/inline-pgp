import React from 'react'

import bem from '../../utils/bem'

import style from './tab.sass'

const c = bem(style)('tab')

const Tab = ({active, large, children, onClick, ...rest}) => (
    <a className={c({active, large})} onClick={onClick} {...rest}>{children}</a>
)

export default Tab
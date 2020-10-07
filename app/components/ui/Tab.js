import React from 'react'

import style from './tab.sass'

import bem from '../../utils/bem'


const c = bem(style)('tab')

const Tab = ({ active, large, children, onClick, ...rest }) => (
    <a className={c({ active, large })} onClick={onClick} {...rest}>{children}</a>
)

export default Tab

import React from 'react'

import style from './button.sass'

import Spinner from '../../svg/Spinner.svg'
import bem from '../../utils/bem'

const c = bem(style)('button')

const Button = ({ children, outline, primary, dangerous, pressed, value, type, loading, ref_, ...rest }) => (
    <button
        ref={ref_}
        className={c({ solid: !outline, primary, outline, pressed, dangerous })}
        {...{ ...rest, type: type || 'button' }}
    >
        {loading && <div className={c('spinner')}><Spinner color={primary ? 'white' : 'black'} size={30} /></div>}
        <div style={{ visibility: loading ? 'hidden' : null }}>{children || value}</div>
    </button>
)

export default Button

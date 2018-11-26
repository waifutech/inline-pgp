import React from 'react'

import bem from '../../utils/bem'
import style from './button.sass'
const Spinner = require('../../svg/Spinner.svg')

const c = bem(style)('button')

const Button = ({children, outline, primary, dangerous, pressed, value, type, loading, ref_, ...rest}) => (
    <button
        ref={ref_}
        className={c({solid: !outline, primary, outline, pressed, dangerous})}
        {...{...rest, type: !!type ? type : 'button'}}
    >
        {loading && <div className={c('spinner')}><Spinner color={primary ? 'white' : 'black'} size={30}/></div>}
        <div style={{visibility: loading ? 'hidden' : null}}>{children || value}</div>
    </button>
)


export default Button
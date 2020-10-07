import compact from 'lodash.compact'
import isArray from 'lodash.isarray'
import isNil from 'lodash.isnil'
import React from 'react'

import compactObject from '../../utils/compactObject'

const arr = (v) => isArray(v) ? v : (isNil(v) ? [] : [v])

const Grid = (props) => {
    const { children, className, style, n = 0, padding = 20 } = props
    const cn = compact(arr(children))

    let lastRowElementCount = (cn.length % n)

    lastRowElementCount = lastRowElementCount === 0 ? n : lastRowElementCount

    const columns = !!n
    const isLastRow = i => i >= cn.length - lastRowElementCount
    const isLastColumn = i => !((i + 1) % n)

    const content = cn.map((c, i) => React.cloneElement(c, {
        key: i,
        style: compactObject({
            float: 'left',
            width: columns ? `calc(${100 / n}% - ${(padding * (n - 1)) / n}px)` : null,
            marginRight: ((!columns && i !== cn.length - 1) || !isLastColumn(i)) ? `${padding}px` : '0px',
            marginBottom: (columns && !isLastRow(i)) ? `${padding}px` : null,
            boxSizing: 'border-box',
            ...((c.props || {}).style || {}),
        }),
    }))

    return (
        <div className={className} style={{ ...style }}>{content}<div style={{ clear: 'both' }} /></div>
    )
}

export default Grid

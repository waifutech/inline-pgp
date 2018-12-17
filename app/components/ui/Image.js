const React = require('react')

const compactObject = require('../../utils/compactObject')

const Image = ({className, style, children, src, width, height, inline, size, ...rest}) => {
    const d = compactObject({
        width: width || size,
        height: height || size,
    })

    return <div
        className={className}
        style={{
            position: 'relative',
            background: `url(${src}) center center / cover no-repeat`,
            maxWidth: '100%',
            ...(inline ? {display: 'inline-block'} : {}),
            ...d,
            ...style,
        }}
        {...rest}

    >{children}</div>

}

module.exports = Image

import isString from 'lodash.isstring'
import React from 'react'
import { v4 as uuid } from 'uuid'

export default class FileInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = { id: uuid() }
    }

    async upload(ev) {
        const { onUpload } = this.props

        const ret = Promise.all(([...(this.__upload.files)]).map(async f => {
            return onUpload(f, ev)
        }))

        this.__upload.value = ''

        return ret
    }

    render() {
        const { id } = this.state
        let { multiple, children, onUpload, ...rest } = this.props

        if (!children || isString(children)) {
            if (!children) { children = `Upload file${multiple ? 's' : ''}` }
            children = <span>{children}</span>
        }

        return (
            <div {...rest}>
                <input
                    multiple={multiple}
                    style={{
                        width: '0.1px',
                        height: '0.1px',
                        opacity: 0,
                        overflow: 'hidden',
                        position: 'absolute',
                        zIndex: -1,
                    }}
                    id={id}
                    name='file'
                    type='file'
                    ref={dom => this.__upload = dom}
                    onChange={this.upload.bind(this)}
                />
                <label htmlFor={id} style={{ width: '100%', cursor: 'pointer' }}>{children}</label>
            </div>
        )
    }
}

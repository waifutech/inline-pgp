// if(window.self === window.top) {
//     document.body.innerHTML = 'NOPE'
//     throw new Error('NOPE')
// }

import 'babel-core/register'
import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import ReactResizeDetector from 'react-resize-detector'

import ContentEditor from './components/ContentEditor'
import ContentKey from './components/ContentKey'
import ContentMessage from './components/ContentMessage'
import Passwords from './components/Passwords'
import toast from './components/ui/Toast'
import Keyring from './Keyring'
import Storage from './Storage'
import Spinner from './svg/Spinner.svg'

import './base.sass'

const query = new URLSearchParams(window.location.search)
const id = query.get('id')
const type = query.get('type')

const parent = window.opener || window.parent

const send = (message) => {
    parent.postMessage({ id, ...message }, '*')
}

const pgpBlock = new Promise(resolve => {
    window.addEventListener('message', (event) => {
        const { data: { type, data } } = event

        switch (type) {
        case 'PGP_BLOCK': return resolve(data)
        }
    }, false)
})

if (type !== 'editor') { send({ type: 'PGP_FRAME_READY' }) }

class Frame extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    async componentDidMount() {
        const block = await pgpBlock

        this.setState({ block })
    }

    render() {
        const { block } = this.state

        if (!block && ['message', 'key'].includes(type)) { return <div className='center'><Spinner /></div> }

        switch (type) {
        case 'message': return <ContentMessage messageBlock={block} />
        case 'key': return <ContentKey keyBlock={block} />
        case 'editor': return <ContentEditor onSubmit={(data) => send({ type: 'PGP_EDITOR_MESSAGE', data })} />
        }
    }
}

;(async () => {
    await Storage.initAll()
    await Keyring.instance().init()

    ReactDOM.render(
        <ReactResizeDetector
            handleHeight
            onResize={() => {
                if (type === 'editor') { return }
                setTimeout(() => send({ type: 'PGP_FRAME_HEIGHT', height: document.body.clientHeight }))
            }}
        >
            <div>
                <toast.Container clear top='20px' />
                <Passwords />
                <Frame {...{ id, type }} />
            </div>
        </ReactResizeDetector>,
        document.getElementById('mountpoint'),
    )
})()

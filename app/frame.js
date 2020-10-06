// if(window.self === window.top) {
//     document.body.innerHTML = 'NOPE'
//     throw new Error('NOPE')
// }

require("babel-core/register")
require("babel-polyfill")

const React = require('react')
const ReactDOM = require('react-dom')
const {'default': ReactResizeDetector} = require('react-resize-detector')

const Keyring = require('./Keyring')
const Storage = require('./Storage')
const ContentKey = require('./components/ContentKey')
const ContentMessage = require('./components/ContentMessage')
const ContentEditor = require('./components/ContentEditor')
const Passwords = require('./components/Passwords')
const toast = require('./components/ui/Toast')
const Spinner = require('./svg/Spinner.svg')

const baseStyle = require('./base.sass')

const query = new URLSearchParams(window.location.search)
const id = query.get('id')
const type = query.get('type')

const parent = window.opener || window.parent

const send = (message) => {
    // console.log(`send ${id}`, {id, ...message})
    parent.postMessage({id, ...message}, '*')
}

const pgpBlock = new Promise((resolve, reject) => {
    // console.log(`frame listener ${id}`)

    window.addEventListener('message', (event) => {
        // console.log(event)

        const {data: {type, data}, origin} = event

        switch(type) {
            case 'PGP_BLOCK': return resolve(data)
        }
    }, false)
})

if(type !== 'editor')
    send({type: 'PGP_FRAME_READY'})

class Frame extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    async componentDidMount() {
        const block = await pgpBlock
        this.setState({block})
    }

    render() {
        const {block} = this.state

        if(!block && ['message', 'key'].includes(type))
            return <div className={'center'}><Spinner /></div>

        switch (type) {
            case 'message': return  <ContentMessage messageBlock={block} />
            case 'key': return  <ContentKey keyBlock={block} />
            case 'editor': return  <ContentEditor onSubmit={(data) => send({type: 'PGP_EDITOR_MESSAGE', data})}/>
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
                if(type === 'editor')
                    return
                setTimeout(() => send({type: 'PGP_FRAME_HEIGHT', height: document.body.clientHeight}))
            }}
        >
            <div>
                <toast.Container clear top={'20px'} />
                <Passwords />
                <Frame {...{id, type}}/>
            </div>
        </ReactResizeDetector>,
        document.getElementById('mountpoint')
    )
})()





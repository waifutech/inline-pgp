require("babel-core/register")
require("babel-polyfill")

const React = require('react')
const ReactDOM = require('react-dom')

const KeyStorage = require('./Keyring.js')
const Storage = require('./Storage.js')
const KeysTab = require('./components/TabKeys.js')
const Passwords = require('./components/Passwords.js')
const EncDecTab = require('./components/TabEncDec.js')
const SettingsTab = require('./components/TabSettings.js')
const {'default': Tab} = require('./components/ui/Tab')
const Fade = require('./components/ui/Fade')
const Icon = require('./components/ui/Icon')
const {'default': Section} = require('./components/ui/Section')
const toast = require('./components/ui/Toast')

const Github = require('./svg/Github.svg')
const baseStyle = require('./base.sass')
const layoutStyle = require('./layout.sass')

const github = 'https://github.com/waifutech/inline-pgp'

class Popup extends React.Component {
    constructor() {
        super()
        this.state = {tab: 'KEYS'}
    }

    render() {
        const {tab} = this.state
        return (
            <div className={layoutStyle.base}>
                <Passwords />
                <div className={layoutStyle.header}>
                    <Tab large active={tab === 'KEYS'} onClick={() => this.setState({tab: 'KEYS'})}>Keys</Tab>
                    <Tab large active={tab === 'ENCDEC'} onClick={() => this.setState({tab: 'ENCDEC'})}>Encrypt/Decrpyt</Tab>
                    <Tab large active={tab === 'SETTINGS'} onClick={() => this.setState({tab: 'SETTINGS'})}>Settings</Tab>
                    <Tab large active={tab === 'ABOUT'} onClick={() => this.setState({tab: 'ABOUT'})}>About</Tab>
                </div>
                <div className={layoutStyle.content}>
                    <toast.Container clear />
                    <Fade>
                        {(() => {
                            switch(tab) {
                                case 'KEYS': return <KeysTab key={'keys'}/>
                                case 'ENCDEC': return <EncDecTab key={'encdec'}/>
                                case 'SETTINGS': return <SettingsTab key={'settings'} />
                                case 'ABOUT': default: return <div key={'about'}>
                                    <Section><Github size={20} style={{marginRight: '.5em', position: 'relative', top: '5px'}}/> <a href={github}>{github}</a></Section>
                                </div>
                            }
                        })()}
                    </Fade>
                </div>
            </div>
        )
    }
}

;(async () => {
    await Storage.initAll()
    await KeyStorage.instance().init()

    ReactDOM.render(<Popup />, document.getElementById('mountpoint'))
})()
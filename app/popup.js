import 'babel-core/register'
import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import Passwords from './components/Passwords.js'
import TabEncDec from './components/TabEncDec.js'
import TabKeys from './components/TabKeys.js'
import TabSettings from './components/TabSettings.js'
import Fade from './components/ui/Fade'
import Section from './components/ui/Section'
import Tab from './components/ui/Tab'
import toast from './components/ui/Toast'
import KeyStorage from './Keyring.js'
import layoutStyle from './layout.sass'
import Storage from './Storage.js'
import Github from './svg/Github.svg'
import './base.sass'

const github = 'https://github.com/waifutech/inline-pgp'

class Popup extends React.Component {
    constructor() {
        super()
        this.state = { tab: 'KEYS', encPlaintext: '', encCiphertext: '', decPlaintext: '', decCiphertext: '' }
    }

    render() {
        const { tab, encPlaintext, encCiphertext, decPlaintext, decCiphertext } = this.state

        return (
            <div className={layoutStyle.base}>
                <Passwords />
                <div className={layoutStyle.header}>
                    <Tab large active={tab === 'KEYS'} onClick={() => this.setState({ tab: 'KEYS' })}>Keys</Tab>
                    <Tab large active={tab === 'ENCDEC'} onClick={() => this.setState({ tab: 'ENCDEC' })}>Encrypt/Decrpyt</Tab>
                    <Tab large active={tab === 'SETTINGS'} onClick={() => this.setState({ tab: 'SETTINGS' })}>Settings</Tab>
                    <Tab large active={tab === 'ABOUT'} onClick={() => this.setState({ tab: 'ABOUT' })}>About</Tab>
                </div>
                <div className={layoutStyle.content}>
                    <toast.Container clear />
                    <Fade>
                        {(() => {
                            switch (tab) {
                            case 'KEYS': return <TabKeys key='keys' />
                            case 'ENCDEC': return <TabEncDec key='encdec' {...{ encPlaintext, encCiphertext, decPlaintext, decCiphertext }} onChange={diff => this.setState(diff)} />
                            case 'SETTINGS': return <TabSettings key='settings' />
                            case 'ABOUT': default: return <div key='about'>
                                <Section><Github size={20} style={{ marginRight: '.5em', position: 'relative', top: '5px' }} /> <a href={github}>{github}</a></Section>
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

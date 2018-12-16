require("babel-core/register")
require("babel-polyfill")

const {'default': insertAtCursor} = require('insert-text-at-cursor')
const uuid = require('uuid')

const cfg = require('./config')
const Storage = require('./Storage')
const Settings = require('./Settings')
const innertext = require('./utils/innertext')
const {'default': replacePgp, msgBlockRx, publicKeyBlockRx, privateKeyBlockRx} = require('./utils/replacePgp')

const blocks = {}

const deepestMatching = (node, condition) => {
    const matches = condition(node)

    if(!matches && !condition(node)/*TODO magic*/)
        return []

    const foundUnflattened = [...node.childNodes].map(n => deepestMatching(n, condition))
    const found =  [].concat.apply([], foundUnflattened).filter(n => !!n)

    if(!found.length)
        return [node]

    return found
}

const random = uuid()

const frameDomId = (id) => `${random}-pgp-frame-${id}`

const frameById = (id) => document.getElementById(frameDomId(id))

const mountpoint = (type) => (block) => {
    const id = uuid()
    blocks[id] = block

    return `<iframe 
                    id="${frameDomId(id)}"
                    style="min-height: 90px; width: 100%; border: none; margin-top: .25em; margin-bottom: .25em; transition: height 0.1s;" 
                    src="chrome-extension://${cfg.extId}/frame.html?id=${id}&type=${type}">    
            </iframe> `
}


const updateDom = (dom) => {
    [
        {rx: msgBlockRx(), mp: mountpoint('message')},
        {rx: publicKeyBlockRx(), mp: mountpoint('key')},
        {rx: privateKeyBlockRx(), mp: mountpoint('key')},
    ].map(({rx, mp}) => {
        rx.lastIndex = 0

        const pgpNodes = deepestMatching(dom, (node) => {
            if(!node.innerHTML)
                return false
            return !!rx.exec(innertext(node.innerHTML))
        })

        const replace = replacePgp(rx, mp)

        const notransform = ['[contenteditable="true"]', 'textarea', ...Settings.getNotransformForPage()]

        ;[...pgpNodes]
            .filter(n => !notransform.find(s => !!n.closest(s)))
            .forEach(async n => {
                const replaced = replace(n.innerHTML).join('')
                if(n.innerHTML !== replaced)
                    n.innerHTML = replaced
            })
    })
}

class Editor {
    constructor() {
        document.addEventListener('mousedown', (ev) => {
            if(ev.button == 2) {
                this.lastClicked = event.target
            }
        }, true)
    }

    editLastClicked() {
        this.edit(uuid(), this.lastClicked)
    }

    edit(id, element) {
        this.close()
        this.id = id
        this.element = element

        const address = `chrome-extension://${cfg.extId}/frame.html?id=${id}&type=editor`

        this.window = window.open(
            address,
            '_blank',
            'directories=no, titlebar=no, toolbar=no, location=no, status=no, menubar=no, scrollbars=no, resizable=no, width=600, height=420'
        )
    }

    submitted(value) {
        insertAtCursor(this.element, value)
        this.close()
    }

    close() {
        if(!!this.window)
            this.window.close()
        this.window = null
        this.element = null
    }
}

const editor = new Editor()

chrome.runtime.onMessage.addListener(async (message, sender, cb) => {
    const {action} = message

    if(action === 'encrypt')
        editor.editLastClicked()
})

const allowedOrigin = `chrome-extension://${cfg.extId}`

const frameReady = (id) =>
    frameById(id).contentWindow.postMessage({type: 'PGP_BLOCK', data: blocks[id]}, allowedOrigin)


const frameHeight = (id, height) =>
    frameById(id).style.height = `${height}px`

window.addEventListener('message', (event) => {
    const {data: {type, id, height, data}, origin} = event

    if(origin !== allowedOrigin)
        return

    switch(type) {
        case 'PGP_FRAME_READY': return frameReady(id)
        case 'PGP_FRAME_HEIGHT': return frameHeight(id, height)
        case 'PGP_EDITOR_MESSAGE': return editor.submitted(data)
    }

}, false)

;(async () => {
    await Storage.settings().init()
    if(Settings.isDisabledForPage())
        return
    // setTimeout(() => updateDom(document.body), 2000)
    setInterval(() => updateDom(document.body), 1000)
    updateDom(document.body)
})()

require("babel-core/register")
require("babel-polyfill")

const Storage = require('./Storage')
const Keyring = require('./Keyring')

;(async () => {
    (await Storage.session().init()).clear()
    await Keyring.instance().init(true)
})()

const queryTabs = (query) => new Promise((resolve, reject) => chrome.tabs.query(query, resolve))

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'encrypt-selected',
        title: 'Write encrypted message',
        type: 'normal',
        contexts: ['editable'],
    })
})

chrome.contextMenus.onClicked.addListener((ev, tab) => {
    if(ev.menuItemId === 'encrypt-selected')
        if (tab)
            chrome.tabs.sendMessage(tab.id, {action: 'encrypt'})
})

chrome.runtime.onMessage.addListener(async (message) => {
    const {redirect} = message

    if(redirect) {
        const tabs = [
            ...await queryTabs({currentWindow: true, active: true}),
        ]
        tabs.map(tab => chrome.tabs.sendMessage(tab.id, message))
    }
})


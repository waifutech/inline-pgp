/* eslint-disable-next-line import/no-commonjs, import/order */
const pgp = require('openpgp')

import Settings from './Settings'
import Storage from './Storage'

pgp.config.commentstring = 'https://chrome.google.com/webstore/detail/inline-pgp/ilbcgbbjobmcldeiebijihfbndolhbfl'
pgp.config.compression = pgp.enums.compression.zip
pgp.config.deflate_level = 9
pgp.config.debug = true

const applySettings = () => {
    pgp.config.show_version = !Settings.getHideComments()
    pgp.config.show_comment = !Settings.getHideComments()

    if (document.location.protocol === 'chrome-extension:') {
        pgp.destroyWorker()
        pgp.initWorker({ path: 'lib/openpgp.worker.min.js' })
    }
}

;(async () => {
    await Storage.settings().init()
    applySettings()
})()

Storage.settings().subscribeChange(applySettings)

export default pgp

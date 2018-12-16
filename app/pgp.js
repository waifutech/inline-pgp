const pgp = require('openpgp')
const Settings = require('./Settings')
const Storage = require('./Storage')

pgp.config.commentstring = 'https://chrome.google.com/webstore/detail/inline-pgp/ilbcgbbjobmcldeiebijihfbndolhbfl'
pgp.config.compression = pgp.enums.compression.zip
pgp.config.deflate_level = 9
pgp.config.debug = true

const applySettings = () => {
    pgp.config.show_version = !Settings.getHideComments()
    pgp.config.show_comment = !Settings.getHideComments()
    // console.log('applying settings', pgp.config)

    if(document.location.protocol === 'chrome-extension:') {
        pgp.destroyWorker()
        pgp.initWorker({path: 'lib/openpgp.worker.min.js' })
    }

}

applySettings()
Storage.settings().subscribeChange(applySettings)



module.exports = pgp

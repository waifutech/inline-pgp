const pgp = require('openpgp')

pgp.config.commentstring = 'https://chrome.google.com/webstore/detail/inline-pgp/ilbcgbbjobmcldeiebijihfbndolhbfl'
pgp.config.compression = pgp.enums.compression.zip
pgp.config.deflate_level = 9
pgp.config.debug = true

if(document.location.protocol === 'chrome-extension:')
    pgp.initWorker({path: 'lib/openpgp.worker.min.js' })

module.exports = pgp
const dataUriRx = () => new RegExp(/data:(([a-z0-9]+\/[a-z0-9]+)(;[a-z0-9\-]+\=[a-z0-9\%\-\_\.\~\)\(]+)?)?(;base64)?,([a-z0-9\+\=\/]*)/ig)

const insertParameter = (dataUri, name, value) => {
    const match = dataUriRx().exec(dataUri)
    return`data:${match[2]};${name}=${encodeURIComponent(value)}${match[3] || ''}${match[4]},${match[5]}`
}

dataUriRx.insertParameter = insertParameter

module.exports = dataUriRx

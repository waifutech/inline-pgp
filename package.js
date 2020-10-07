/* eslint-disable import/no-commonjs */

const ChromeExtension = require('crx')
const fs = require('fs-extra')

// const buildDir = './packaged'
const buildDir = `${__dirname}/packaged`
const cp = filename => fs.copy(`./${filename}`, `${buildDir}/${filename}`)

;(async () => {
    await fs.emptyDir(buildDir)
    await Promise.all(['dist', 'lib', 'popup.html', 'frame.html', 'icon.png', 'manifest.json'].map(cp))

    const crx = new ChromeExtension({
        privateKey: fs.readFileSync('./key.pem'),
    })

    await crx.load(buildDir)
    const crxBuffer = await crx.pack()
    // const updateXML = crx.generateUpdateXML()

    // fs.writeFile("../update.xml", updateXML)
    fs.writeFile('./packaged.crx', crxBuffer)
})()

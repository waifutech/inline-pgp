const wait = (time) => new Promise((resolve, reject) => setTimeout(() => resolve(), time))

module.exports = wait
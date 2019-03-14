const fs = require('fs')
const util = require('../lib/util')
const DIR = '.test'

const isAsync = fn => fn.constructor.name === 'AsyncFunction'

const before = (name = '') => {
  const DIR_FULL = DIR + name
  if (!fs.existsSync(`./${DIR_FULL}`)) {
    util.mkdir(DIR_FULL)
  }
  process.chdir(`./${DIR_FULL}`)
}

const after = (name = '') => {
  const DIR_FULL = DIR + name
  process.chdir('../')
  if (fs.existsSync(`./${DIR_FULL}`)) {
    util.rmdir(DIR_FULL)
  }
}

const run = (name = '', callback, commonCallback) => {
  before(name)

  if (commonCallback) {
    commonCallback()
  }

  if (isAsync(callback)) {
    return new Promise(async () => {
      try {
        await callback()
      } catch (error) { }
      after(name)
    })
  } else {
    callback()
    after(name)
  }
}

module.exports = {
  before,
  after,
  run
}

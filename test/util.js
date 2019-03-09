const fs = require('fs')
const util = require('../lib/util')
const DIR = '.test'

module.exports = {
  before() {
    if (!fs.existsSync(`./${DIR}`)) {
      util.mkdir(DIR)
    }
    process.chdir(`./${DIR}`)
  },
  after() {
    process.chdir('../')
    if (fs.existsSync(`./${DIR}`)) {
      util.rmdir(DIR)
    }
  }
}

const fs = require('fs')
const util = require('../../lib/util')
const TEST_CONST = require('../TEST_CONST')
const start = 0
const end = 10

module.exports = mode => {
  switch (mode) {
    case 'list':
      let list = []
      for (let i = start; i < end; i++) {
        list.push({
          url: 'http://my-test-url.com/video',
          name: util.cachePath(TEST_CONST.NAME, `${i}.ts`)
        })
      }
      return list

    case 'mock_files':
      for (let i = start; i < end; i++) {
        fs.copyFileSync(TEST_CONST.PATH.VIDEO, util.cachePath(TEST_CONST.NAME, `${i}.ts`))
      }
      return

    default:
      return null
  }
}

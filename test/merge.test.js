const fs = require('fs')
const expect = require('chai').expect
const TEST_CONST = require('./TEST_CONST')
const test_util = require('./util')

const merge = require('../lib/merge')
const config = require('../lib/config')
const util = require('../lib/util')

// Get download over list
const mock_video_instance = require(TEST_CONST.PATH.VIDEO_LIST)
const mock_video_list = mock_video_instance('list')

describe('Merge video test', () => {
  before(() => {
    test_util.before()

    /**
     * Set mock file
     */
    // Copy m3u8 file
    fs.copyFileSync(TEST_CONST.PATH.FILE, util.getDir(TEST_CONST.FILE))
    // Make directories
    util.mkdir(util.mainCachePath())
    util.mkdir(util.cachePath(TEST_CONST.NAME))
    mock_video_instance('mock_files')
  })

  after(() => {
    test_util.after()
  })

  it('M3u8 file should exist', () => {
    expect(fs.existsSync(TEST_CONST.FILE)).to.be.true
  })

  it('Can merge videos', async () => {
    const opts = Object.assign({}, config, {
      name: TEST_CONST.NAME,
      m3u8: TEST_CONST.FILE
    })

    await merge(opts, mock_video_list.length)

    expect(fs.existsSync(util.getDir(opts.output, TEST_CONST.VIDEO))).to.be.true
  })
})

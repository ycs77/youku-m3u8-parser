const fs = require('fs')
const expect = require('chai').expect
const nock = require('nock')
const TEST_CONST = require('./TEST_CONST')
const test_util = require('./util')

const download = require('../lib/download')
const config = require('../lib/config')
const util = require('../lib/util')

// Get video file
let mock_video = fs.readFileSync(TEST_CONST.PATH.VIDEO, 'UTF-8')
let mock_video_list = null

// nock instance
let nock_video = null

describe('Downloaded test', () => {
  before(() => {
    test_util.before()

    /**
     * Set mock file
     */
    // Copy m3u8 file
    fs.copyFileSync(TEST_CONST.PATH.FILE, util.getDir(TEST_CONST.FILE))
    // Get download over list
    mock_video_list = require(TEST_CONST.PATH.VIDEO_LIST)('list')

    // Nock http
    nock_video = nock('http://my-test-url.com')
      .persist()
      .get('/video')
      .reply(200, mock_video)
  })

  after(() => {
    // Persist false in nock
    nock_video.persist(false)

    test_util.after()
  })

  it('M3u8 file should exist', () => {
    expect(fs.existsSync(TEST_CONST.FILE)).to.be.true
  })

  it('Can download video', async () => {
    const opts = Object.assign({}, config, {
      name: TEST_CONST.NAME,
      m3u8: TEST_CONST.FILE
    })

    const successVideoArray = await download(opts)
    expect(successVideoArray).to.deep.equal(mock_video_list)
  })
})

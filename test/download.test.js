const fs = require('fs')
const expect = require('chai').expect
const nock = require('nock')
const TEST_CONST = require('./TEST_CONST')
const test_util = require('./util')

const download = require('../lib/download')
const config = require('../lib/config')
const util = require('../lib/util')

const opts = Object.assign({}, config, {
  name: TEST_CONST.NAME,
  m3u8: TEST_CONST.FILE
})

// Get video file
let mock_video = fs.readFileSync(TEST_CONST.PATH.VIDEO, 'UTF-8')
let mock_video_list = null

// nock instance
let nock_video = null
const getNock = code => nock('http://my-test-url.com')
  .persist()
  .get('/video')
  .reply(code, mock_video)

function run(name, callback) {
  test_util.run(name, callback, () => {
    /**
     * Set mock file
     */
    // Copy m3u8 file
    fs.copyFileSync(TEST_CONST.PATH.FILE, util.getDir(TEST_CONST.FILE))
    // Get download over list
    mock_video_list = require(TEST_CONST.PATH.VIDEO_LIST)('list')
  })
}

describe('Downloaded test', () => {
  it('M3u8 file should exist', () => {
    run('', () => {
      expect(fs.existsSync(TEST_CONST.FILE)).to.be.true
    })
  })

  it('Download video successfully', () => {
    run('success', async () => {
      nock_video = getNock(200)
      const result = await download(opts)
      expect(result).to.deep.equal(mock_video_list)
      nock_video.persist(false)
    })
  })

  it('Download video return 403', () => {
    run('403', async () => {
      nock_video = getNock(403)
      try {
        await download(opts)
      } catch (error) {
        expect(error).to.equal(`下載失敗：${TEST_CONST.NAME} 影片已過期`)
      }
      nock_video.persist(false)
    })
  })

  it('Download video return 404', () => {
    run('404', async () => {
      nock_video = getNock(404)
      try {
        await download(opts)
      } catch (error) {
        expect(error).to.equal(`下載失敗：${TEST_CONST.NAME} 影片不存在`)
      }
      nock_video.persist(false)
    })
  })

  it('Download video error', () => {
    run('500', async () => {
      nock_video = getNock(500)
      try {
        await download(opts)
      } catch (error) {
        expect(error).to.equal(`下載失敗：${TEST_CONST.NAME} `)
      }
      nock_video.persist(false)
    })
  })
})

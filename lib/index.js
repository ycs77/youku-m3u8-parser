const download = require('./download')
const merge = require('./merge')
const util = require('./util')

module.exports = options => new Promise(async resolve => {
  try {
    // 讀取 m3u8 並下載，返回成功下載的影片陣列
    const successObjArray = await download(options)

    // 合併
    await merge(options, successObjArray.length)

    util.consoleSuccess(`任務完成：${options.name}`)
    resolve()
  } catch (error) {
    util.consoleError(error.message || error)
    resolve()
  }
})

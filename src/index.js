const download = require('./download')
const merge = require('./merge')
const defaultConfig = require('./default_config')
const util = require('./util')

module.exports = options => {
  let opts = Object.assign({}, defaultConfig, options)

  return new Promise(async (resolve, reject) => {
    try {
      // 讀取 m3u8 並下載，返回成功下載的影片陣列
      const successObjArray = await download(opts)

      // 合併
      await merge(opts, successObjArray.length)

      util.consoleSuccess(`下載完成：${opts.name}`)
      util.consoleSuccess('')

      resolve()
    } catch (error) {
      util.consoleError(error.message || error)

      reject(error)
    }
  })
}

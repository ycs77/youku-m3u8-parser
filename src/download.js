const fs = require('fs')
const util = require('./util')

// 紀錄已經開始下載的任務數
let downloadStartCount = 0
// 紀錄已經結束下載的任務數
let downloadEndCount = 0

// 需要下載影片的信息的陣列
let objArray = []
// 下載成功的影片信息陣列
let successObjArray = []

/**
 * 下載影片
 *
 * @param {Function} callback
 */
function download(callback) {
  if (downloadStartCount < objArray.length) {
    const obj = objArray[downloadStartCount]
    downloadStartCount++

    return new Promise((resolve, reject) => {
      const fs = require('fs')
      const http = require(!/^https/.test(obj.url) ? 'http' : 'https')

      // 建立檔案
      let fd = fs.openSync(obj.name, 'w')

      // 使用 HTTP 下載影片
      http.get(obj.url, async res => {

        // 如果返回錯誤 (4xx 或 5xx)
        if (/^[45]\d{2}$/.test(res.statusCode)) {
          fs.closeSync(fd)
          fs.unlink(obj.name, () => { })
          downloadEndCount++

          switch (res.statusCode) {
            case 404:
              console.error('\x1b[31m%s\x1b[0m', `影片不存在:\t${obj.name}`)
              break;

            case 403:
              console.error('\x1b[31m%s\x1b[0m', `影片已過期:\t${obj.name}`)
              break;

            default:
              console.error('\x1b[31m%s\x1b[0m', `下載錯誤:\t${obj.name}`)
              break;
          }

          // 下載下一部影片
          download(callback)

          resolve()
          return
        }

        // 返回成功
        let dataArray = []
        res.on('data', (data) => {
          dataArray.push(data)
        })
        res.on('end', async () => {
          // 寫入檔案
          for (let key in dataArray) {
            fs.writeSync(fd, dataArray[key], 0, dataArray[key].length, null)
          }
          fs.closeSync(fd)
          downloadEndCount++
          console.log('\x1b[32m%s\x1b[0m', `下載:\t${obj.name}`)

          // 下載成功的影片信息陣列
          successObjArray.push(obj)

          // 下載下一部影片
          download(callback)

          resolve()
          return
        })

      }).on('error', error => {
        reject(error)
        return
      })
    }).then(() => {
      // 最後一個任務
      if (callback && downloadEndCount === objArray.length) {
        callback()
      }
    })
  }
}

module.exports = opts => {
  return new Promise((resolve, reject) => {

    // 紀錄已經開始下載的任務數
    downloadStartCount = 0
    // 紀錄已經結束下載的任務數
    downloadEndCount = 0

    // 需要下載影片的信息的陣列
    objArray = []
    // 下載成功的影片信息陣列
    successObjArray = []

    // 同時下載的最大任務數
    const downloadThread = opts.max

    if (!opts.m3u8) {
      opts.m3u8 = `${opts.name}.m3u8`
    }

    // 判斷 input 資料夾是否存在
    if (!fs.existsSync(opts.input)) {
      reject(`請新增 ${opts.input} 資料夾`)
      return
    }
    if (!fs.existsSync(`${opts.input}\\${opts.m3u8}`)) {
      reject(`請將 ${opts.m3u8} 檔移至 ${opts.input} 資料夾裡`)
      return
    }

    /**
     * 暫存資料夾
     */
    // 建立主要下載暫存資料夾
    util.mkdir(util.mainCachePath)
    // 刪除並建立下載暫存資料夾
    util.rmdir(util.cachePath(opts.name))
    util.mkdir(util.cachePath(opts.name))

    /**
     * 讀取 m3u8 檔
     */
    fs.readFile(`${opts.input}\\${opts.m3u8}`, 'utf-8', async (error, data) => {
      if (error) {
        reject(error)
        return
      }

      // 逐行讀取 m3u8 中的 URL
      let array
      let index = 0
      while (array = util.m3u8UrlReg.exec(data)) {
        let obj = {}

        obj.url = array[0] + ''
        obj.name = util.cachePath(opts.name, index, '.ts')

        objArray.push(obj)
        index++
      }

      /**
       * 沒有匹配的連結
       */
      if (!objArray.length) {
        // 刪除快取資料夾
        util.rmdir(util.cachePath(opts.name))
        util.rmdir(util.mainCachePath, false)
        reject({
          message: '執行完成沒有匹配的連結',
          color: 'yellow'
        })
        return
      }

      /**
       * 遍歷陣列，逐個下載影片
       */
      for (let start = downloadStartCount; downloadStartCount < objArray.length;) {
        // 如果已經超過可同時下載的最大任務數，就退出；
        // 等待有任務結束(不管成功或失敗)才繼續下載。
        if (downloadStartCount === (start + downloadThread)) {
          break
        }

        /**
         * 下載影片
         */
        download(() => {
          resolve(successObjArray)
        }).catch(error => {
          reject(error)
          return
        })
      }
    })
  })
}

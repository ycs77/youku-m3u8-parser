const fs = require('fs')
const config = require('./config')
const util = require('./util')

function DlVideo(opts) {
  this.opts = opts
  this.objArray = []     // 需要下載影片的信息的陣列
  this.startCount = 0    // 紀錄已經開始下載的任務數
  this.endCount = 0      // 紀錄已經結束下載的任務數
  this.thread = opts.max // 同時下載的最大任務數
}

/**
 * 下載影片
 *
 * @param {Function} callback
 */
DlVideo.prototype.download = function (callback) {
  if (this.startCount < this.objArray.length) {
    const obj = this.objArray[this.startCount]
    this.startCount++

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

          let error = {
            code: res.statusCode
          }

          switch (res.statusCode) {
            case 403:
              error.message = '影片已過期'
              break

            case 404:
              error.message = '影片不存在'
              break
          }

          reject(`下載失敗：${this.opts.name} ${error.message || ''}`)
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

          resolve()

          // 下載下一部影片
          this.download(callback)
        })

      }).on('error', () => {
        reject(`下載失敗：${this.opts.name}`)
        return
      })
    }).then(() => {
      this.endCount++

      // 最後一個任務
      if (callback && this.endCount === this.objArray.length) {
        callback()
      }
    })
  }
}

module.exports = options => new Promise((resolve, reject) => {

  let opts = Object.assign({}, config, options)

  const dl = new DlVideo(opts)

  /**
   * 輸入路徑
   * @param {string|null} filename
   */
  const inputPath = (filename = '') => util.inputPath(opts.input, filename)

  /**
   * 暫存資料夾
   */
  // 判斷 input 資料夾是否存在
  if (!fs.existsSync(inputPath())) {
    reject(`請新增 ${inputPath()} 資料夾`)
    return
  }
  if (!fs.existsSync(inputPath(opts.m3u8))) {
    reject(`請將 ${opts.m3u8} 檔移至 ${inputPath()} 資料夾裡`)
    return
  }

  console.log(`開始下載：${opts.name}`)

  // 建立主要下載暫存資料夾
  util.mkdir(util.mainCachePath(), true)
  // 刪除並建立下載暫存資料夾
  util.rmdir(util.cachePath(opts.name))
  util.mkdir(util.cachePath(opts.name))

  /**
   * 讀取 m3u8 檔
   */
  fs.readFile(inputPath(opts.m3u8), 'utf-8', async (error, data) => {
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
      obj.name = util.cachePath(opts.name, `${index}.ts`)

      dl.objArray.push(obj)
      index++
    }

    /**
     * 沒有匹配的連結
     */
    if (!dl.objArray.length) {
      // 刪除快取資料夾
      util.rmdir(util.cachePath(opts.name))
      util.rmdir(util.mainCachePath(), false)
      reject({
        message: '執行完成：沒有匹配的連結',
        color: 'yellow'
      })
      return
    }

    /**
     * 遍歷陣列，逐個下載影片
     */

    for (let start = dl.startCount; dl.startCount < dl.objArray.length;) {
      // 如果已經超過可同時下載的最大任務數，就退出；
      // 等待有任務結束才繼續下載。
      if (dl.startCount === (start + dl.thread)) {
        break
      }

      /**
       * 下載影片
       */
      dl.download(() => {
        resolve(dl.objArray)
        console.log(`下載完成：${opts.name} 開始合併`)
      }).catch(error => {
        reject(error)
        return
      })
    }
  })

})

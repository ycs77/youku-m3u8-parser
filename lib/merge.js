const fs = require('fs')
const config = require('./config')
const util = require('./util')
const bar = util.progressbar()

module.exports = (options, videoTotal) => {
  let opts = Object.assign({}, config, options)

  return new Promise(async (resolve, reject) => {
    let cmd = ''
    let outputTs = 'concat:'
    const outputVideoName = util.outputPath(opts.output, `${opts.name}.mp4`)

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

    /**
     * 暫存資料夾
     */
    if (!videoTotal) {
      // 刪除快取資料夾
      util.rmdir(util.cachePath(opts.name))
      util.rmdir(util.cacheSplitPath(opts.name))
      util.rmdir(util.mainCachePath(), false)
      reject('目前尚無可合併的影片')
      return
    }

    // 建立主要下載暫存資料夾
    util.mkdir(util.mainCachePath(), true)

    // 建立輸出資料夾
    util.mkdir(util.outputPath(opts.output))
    try {
      // 刪除影片，確保可正常輸出
      fs.unlinkSync(outputVideoName)
    } catch (error) { }

    // 刪除並建立分段暫存資料夾
    util.rmdir(util.cacheSplitPath(opts.name))
    util.mkdir(util.cacheSplitPath(opts.name))

    /**
     * 開始處理影片
     */
    try {
      // 分組後各組的影片數
      let quantity = opts.quantity || videoTotal
      // 群組數量
      let group = Math.ceil(videoTotal / quantity)

      // 關閉預設命令行輸出
      await util.execCommand('@echo off')

      /**
       * 分組處裡影片
       */
      console.log('分組合併影片：')
      bar.start(group, 0, { text: '' })

      for (let i = 0; i < group; i++) {
        if (i * quantity >= videoTotal) {
          break
        }

        // 複製影片片段組成較大的片段
        let param = ''
        for (let j = i * quantity; j < videoTotal && j < (i + 1) * quantity; j++) {
          param += `\"${util.cachePath(opts.name, `${j}.ts`)}\"`
          if (j < videoTotal - 1 && j < (i + 1) * quantity - 1) {
            param += '+'
          }
        }
        cmd = `copy/b ${param} /y \"${util.cacheSplitPath(opts.name, `${i}.ts`)}\"`
        await util.execCommand(cmd)
        bar.increment()

        // 串接影片名稱字串
        outputTs += util.cacheSplitPath(opts.name, `${i}.ts`)
        if (i < group - 1) {
          outputTs += '|'
        }
      }

      bar.stop()

      /**
       * 合併影片
       */
      console.log('合併影片：')
      bar.start(1, 0, { text: '' })

      cmd = opts.ffmpeg + ' -i \"' + outputTs + '\" -c copy -bsf:a aac_adtstoasc -movflags +faststart \"' + outputVideoName + '\"'
      await util.execCommand(cmd)

      bar.update(1)
      bar.stop()

      // 刪除快取資料夾
      util.rmdir(util.cachePath(opts.name))
      util.rmdir(util.cacheSplitPath(opts.name))
      util.rmdir(util.mainCachePath(), false)

      resolve()
    } catch (error) {
      reject(error)
      return
    }
  })
}

const fs = require('fs')
const rimraf = require('rimraf')
const iconv = require('iconv-lite')
const exec = require('child_process').exec
const defaultConfig = require('./default_config')

/**
 * @var {RegExp} 匹配 m3u8 中的網址的正規表達式
 */
const m3u8UrlReg = /(http(s|))?:\/\/.*?\s/g

/**
 * @var {string} 主要下載暫存路徑
 */
const mainCachePath = '.video_cache'

/**
 * 新增資料夾
 *
 * @param {string} dir
 */
function mkdir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0777)
    }
  } catch (error) { }
}

/**
 * 刪除資料夾
 *
 * @param {string} dir
 * @param {boolean} force
 */
function rmdir(dir, force = true) {
  try {
    if (fs.existsSync(dir)) {
      if (force) {
        rimraf.sync(dir)
      } else {
        fs.rmdirSync(dir)
      }
    }
  } catch (error) { }
}

/**
 * 連接文件路徑
 *
 * @param {string} file
 * @param {string} ext
 */
function concatFile(file = null, ext = null) {
  return file !== null ? `\\${file}${ext}` : ''
}

/**
 * 下載暫存路徑
 *
 * @param {string} name
 * @param {string} file
 * @param {string} ext
 */
function cachePath(name, file = null, ext = null) {
  return `${mainCachePath}\\__${name}${concatFile(file, ext)}`
}

/**
 * 分段暫存路徑
 *
 * @param {string} name
 * @param {string} file
 * @param {string} ext
 */
function cacheSplitPath(name, file = null, ext = null) {
  return `${mainCachePath}\\__${name}_split${concatFile(file, ext)}`
}

/**
 * 輸出路徑
 *
 * @param {string} path
 * @param {string} file
 * @param {string} ext
 */
function outputPath(path = defaultConfig.output, file = null, ext = null) {
  return `${path}${concatFile(file, ext)}`
}

/**
 * 輸出命令行結果
 *
 * @param {string} cmdValue
 * @param {string} encoding 可使用的編碼：https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
 */
function execCommand(cmdValue, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    exec(cmdValue, { encoding: 'binary' }, function (error, stdout, stderror) {
      if (error) {
        reject(`ERROR:\n${error}`)
        return
      }

      if (stdout) {
        let out = Buffer.from(stdout, 'binary')
        out = iconv.decode(out, encoding)
        console.log(`stdout:\n${out}`)
      }

      if (stderror) {
        let errout = Buffer.from(stderror, 'binary')
        errout = iconv.decode(errout, encoding)
        console.log(`stderror:\n${errout}`)
      }

      resolve()
    })
  })
}

module.exports = {
  m3u8UrlReg,
  mkdir,
  rmdir,
  concatFile,
  mainCachePath,
  cachePath,
  cacheSplitPath,
  outputPath,
  execCommand
}

const fs = require('fs')
const rimraf = require('rimraf')
const exec = require('child_process').exec
const Progress = require('cli-progress')
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
 * 輸出自訂顏色文字
 *
 * @param {*} text
 * @param {*} color
 */
function textColor(text, color) {
  let colorCharAry = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
    blue: '\x1b[34m%s\x1b[0m',
    magenta: '\x1b[35m%s\x1b[0m',
    cyan: '\x1b[36m%s\x1b[0m',
    white: '\x1b[37m%s\x1b[0m'
  }

  if (!colorCharAry[color]) {
    return text
  }
  return colorCharAry[color].replace('%s', text)
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
 */
function execCommand(cmdValue) {
  return new Promise((resolve, reject) => {
    exec(cmdValue, { encoding: 'binary' }, error => {
      if (error) {
        reject(`Error:\n${error}`)
        return
      }

      resolve()
    })
  })
}

/**
 * 輸出成功文字
 *
 * @param {string} message
 */
function consoleSuccess(message) {
  console.log(textColor(message, 'green'))
}

/**
 * 輸出錯誤文字
 *
 * @param {string} message
 */
function consoleError(message) {
  console.error(textColor(message, 'red'))
}

/**
 * 進度條
 */
function progressbar(options = {}) {
  const opts = {
    format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {text}'
  }

  return new Progress.Bar(
    Object.assign(opts, options),
    Progress.Presets.shades_classic
  )
}

module.exports = {
  m3u8UrlReg,
  mkdir,
  rmdir,
  textColor,
  concatFile,
  mainCachePath,
  cachePath,
  cacheSplitPath,
  outputPath,
  execCommand,
  consoleSuccess,
  consoleError,
  progressbar
}

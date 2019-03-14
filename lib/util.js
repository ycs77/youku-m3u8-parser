const fs = require('fs')
const fswin = require('fswin')
const path = require('path')
const rimraf = require('rimraf')
const isWindows = require('is-windows')
const exec = require('child_process').exec
const config = require('./config')

/**
 * @var {RegExp} 匹配 m3u8 中的網址的正規表達式
 */
const m3u8UrlReg = /(http(s|))?:\/\/.*?(?=\s)/g

/**
 * @var {string} 主要下載暫存資料夾
 */
const mainCacheDir = '.video_cache'

/**
 * 取得當前工作路徑
 *
 * @param {string} filepath
 */
function getDir(...filepath) {
  return path.resolve(process.cwd(), ...filepath)
}

/**
 * 新增資料夾
 *
 * @param {string} dir
 * @param {boolean} hidden
 */
function mkdir(dir, hidden = false) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0777)
      if (hidden) hiddenDir(dir)
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
 * 隱藏資料夾
 *
 * @param {string} dir
 */
function hiddenDir(dir) {
  if (isWindows) {
    fswin.setAttributesSync(dir, {
      IS_HIDDEN: true
    })
  }
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
 * 主要下載暫存路徑
 */
function mainCachePath() {
  return getDir(mainCacheDir)
}

/**
 * 下載暫存路徑
 *
 * @param {string} name
 * @param {string} filename
 */
function cachePath(name, filename = '') {
  return path.resolve(mainCachePath(), `__${name}`, filename)
}

/**
 * 分段暫存路徑
 *
 * @param {string} name
 * @param {string} filename
 */
function cacheSplitPath(name, filename = '') {
  return path.resolve(mainCachePath(), `__${name}_split`, filename)
}

/**
 * 輸入路徑
 *
 * @param {string} filepath
 * @param {string} filename
 */
function inputPath(filepath = config.input, filename = '') {
  return path.resolve(getDir(filepath), filename)
}

/**
 * 輸出路徑
 *
 * @param {string} filepath
 * @param {string} filename
 */
function outputPath(filepath = config.output, filename = '') {
  return path.resolve(getDir(filepath), filename)
}

/**
 * 輸入資料夾名稱格式化
 *
 * @param {*} input
 */
function inputDir(input) {
  switch (input) {
    case null:
    case '':
    case '.':
    case './':
      return '當前'

    default:
      return input
  }
}

/**
 * 執行指令
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

module.exports = {
  m3u8UrlReg,
  getDir,
  mkdir,
  rmdir,
  textColor,
  mainCachePath,
  cachePath,
  cacheSplitPath,
  inputPath,
  outputPath,
  inputDir,
  execCommand,
  consoleSuccess,
  consoleError
}

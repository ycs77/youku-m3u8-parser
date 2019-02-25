#!/usr/bin/env node
const fs = require('fs')
const program = require('commander')
const pkg = require('../package')
const youkuM3u8Parser = require('../src/index')
const defaultConfig = require('../src/default_config')

// Commander output
program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .option('-n, --name <name>', '影片名稱', defaultConfig.name)
  .option('-a, --all', '解析全部的m3u8檔並下載影片', false)
  // .option('-i, --input <path>', 'm3u8資料夾', defaultConfig.input)
  // .option('-o, --output <path>', '影片輸出資料夾', defaultConfig.output)
  .option('-q, --quantity <number>', '輸出處理分組影片數，預設為0(不分組)。處理較大影片才需分組，例：輸入10，會先將10小段影片為單位合併為數個大段的影片後，再合併為完整的影片。', defaultConfig.quantity)
  .option('-m, --max <path>', '同時下載的最大任務數', defaultConfig.max)
  .option('-f, --ffmpeg <path>', 'FFmpeg 路徑', defaultConfig.ffmpeg)
  .option('-e, --encoding <encoding>', '輸出編碼', defaultConfig.encoding)
  .parse(process.argv)

let opts = {}
for (const key in defaultConfig) {
  opts[key] = program[key] || defaultConfig[key]
}

// 判斷 input 資料夾是否存在
if (!fs.existsSync(opts.input)) {
  console.error( // Red
    '\x1b[31m%s\x1b[0m',
    `請新增 ${opts.input} 資料夾`
  )
  return
}

if (program.all) {
  // 取得全部 m3u8 檔的檔名
  let fileList = fs.readdirSync(opts.input)
    .filter(fileName => {
      return /\.m3u8$/.test(fileName)
    })

  if (!fileList.length) {
    console.error( // Red
      '\x1b[31m%s\x1b[0m',
      `請增加 m3u8 檔`
    )
    return
  }

  // 按順序執行下載任務
  new Promise(async () => {
    for (const i in fileList) {
      const promiseOpts = opts
      promiseOpts.m3u8 = fileList[i]
      promiseOpts.name = promiseOpts.m3u8.replace(/.m3u8$/, '')

      try {
        await runParser(promiseOpts, true)
        successCallback(promiseOpts.name)
      } catch (error) {
        errorCallback(error)
      }
    }
  })
} else {
  // 下載一部影片
  runParser(opts)
}

/**
 * 執行優酷影片 m3u8 解析
 *
 * @param {string} m3u8 m3u8 file name
 * @param {boolean} only_promise
 */
function runParser(opts, only_promise = false) {
  if (only_promise) {
    return youkuM3u8Parser(opts)
  }

  return youkuM3u8Parser(opts).then(() => {
    successCallback(opts.name)
  }).catch(errorCallback)
}

function successCallback(name) {
  console.log('\x1b[32m%s\x1b[0m', `${name} 下載完成`) // Green
}

function errorCallback(error) {
  console.error('\x1b[31m%s\x1b[0m', error.message || error) // Red
}

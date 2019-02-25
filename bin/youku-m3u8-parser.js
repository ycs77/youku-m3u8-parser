#!/usr/bin/env node
const fs = require('fs')
const program = require('commander')
const pkg = require('../package')
const youkuM3u8Parser = require('../src/index')
const defaultConfig = require('../src/default_config')
const util = require('../src/util')

// Commander output
program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .option('-n, --name <name>', '影片名稱', defaultConfig.name)
  .option('-a, --all', '解析全部的m3u8檔並下載影片', false)
  // .option('-i, --input <path>', 'm3u8資料夾', defaultConfig.input)
  // .option('-o, --output <path>', '影片輸出資料夾', defaultConfig.output)
  .option('-m, --max <path>', '同時下載的最大任務數', defaultConfig.max)
  .option('-q, --quantity <number>', '輸出處理分組影片數，預設為0(不分組)。處理較大影片才需分組，例：輸入10，會先將10小段影片為單位合併為數個大段的影片後，再合併為完整的影片。', defaultConfig.quantity)
  .option('-f, --ffmpeg <path>', 'FFmpeg 路徑', defaultConfig.ffmpeg)
  .parse(process.argv)

let opts = {}
for (const key in defaultConfig) {
  opts[key] = program[key] || defaultConfig[key]
}

// 判斷 input 資料夾是否存在
if (!fs.existsSync(opts.input)) {
  util.consoleError(`請新增 ${opts.input} 資料夾`)
  return
}

if (program.all) {
  // 下載全部影片

  // 取得全部 m3u8 檔的檔名
  let fileList = fs.readdirSync(opts.input)
    .filter(fileName => {
      return /\.m3u8$/.test(fileName)
    })

  if (!fileList.length) {
    util.consoleError(`請增加 m3u8 檔`)
    return
  }

  // 按順序執行下載任務
  new Promise(async () => {
    for (const i in fileList) {
      const promiseOpts = opts
      promiseOpts.m3u8 = fileList[i]
      promiseOpts.name = promiseOpts.m3u8.replace(/.m3u8$/, '')

      try {
        await youkuM3u8Parser(promiseOpts)
      } catch (error) { }
    }
  })
} else {
  // 下載一部影片
  youkuM3u8Parser(opts)
}

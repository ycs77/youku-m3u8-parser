#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const program = require('commander')
const pkg = require('../package')
const youkuM3u8Parser = require('../lib/index')
const config = require('../lib/config')
const util = require('../lib/util')

let opts = {}

// Commander output
program
  .version(pkg.version, '-v, --version')
  .usage('[name] [options]')
  .description(pkg.description)
  .option('-a, --all', '解析全部的m3u8檔並下載影片', false)
  .option('-i, --input <path>', 'm3u8資料夾', config.input)
  .option('-o, --output <path>', '影片輸出資料夾', config.output)
  .option('-m, --max <number>', '同時下載的最大影片段落數', config.max)
  .option('-am, --allmax <number>', '同時下載的最大任務數', config.allmax)
  .option('-q, --quantity <number>', '輸出處理分組影片數。處理較大影片才需分組，例：輸入10，會先將10小段影片為單位合併為數個大段的影片後，再合併為完整的影片。', config.quantity)
  .option('-f, --ffmpeg <path>', 'FFmpeg 路徑', config.ffmpeg)
  .action(function (vName) {
    if (vName && typeof vName === 'string') {
      opts.name = vName
    } else {
      opts.name = null
    }
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.help()
}

for (const key in config) {
  if (typeof program[key] === typeof config[key]) {
    opts[key] = opts[key] || program[key] || config[key]
  }
}

/**
 * 輸入路徑
 */
const inputPath = () => util.inputPath(opts.input)

// 判斷 input 資料夾是否存在
if (!fs.existsSync(inputPath())) {
  util.consoleError(`請新增 ${path.basename(inputPath())} 資料夾`)
  process.exit()
}

if (program.all) {
  // 下載全部影片

  // 取得全部 m3u8 檔的檔名
  let fileList = fs.readdirSync(inputPath())
    .filter(fileName => {
      return /\.m3u8$/.test(fileName)
    })

  if (!fileList.length) {
    util.consoleError('請增加 m3u8 檔')
    process.exit()
  }

  let startCount = 0

  // 執行下載任務
  const runyoukuM3u8Parser = () => new Promise(async () => {
    if (startCount < fileList.length) {
      const promiseOpts = JSON.parse(JSON.stringify(opts))
      promiseOpts.m3u8 = fileList[startCount]
      promiseOpts.name = promiseOpts.m3u8.replace(/.m3u8$/, '')
      startCount++
      await youkuM3u8Parser(promiseOpts)
      runyoukuM3u8Parser()
    }
  })

  // 遍歷陣列，逐個下載影片
  for (let start = startCount; startCount < fileList.length;) {
    // 如果已經超過可同時下載的最大任務數，就退出；
    // 等待有任務結束才繼續下載。
    if (startCount === (start + opts.allmax)) {
      break
    }

    runyoukuM3u8Parser()
  }
} else {
  if (!opts.m3u8) {
    opts.m3u8 = `${opts.name}.m3u8`
  }

  // 下載一部影片
  youkuM3u8Parser(opts)
}

# 下載優酷影片小工具

解析 m3u8 檔、下載影片

> 參考：[优酷视频下载 - 『编程语言区』  - 吾爱破解](https://www.52pojie.cn/thread-571855-1-1.html)

> 僅支持 Windows

## 安裝依賴

* 安裝 [Node.js](https://nodejs.org/en/)
* 安裝 [FFmpeg](https://www.ffmpeg.org/download.html) (需加入 PATH，[點我看教學](https://jsnwork.kiiuo.com/archives/2705/ffmpeg-windows-安裝/))

## 取得優酷影片 m3u8 檔

使用以下線上工具取得：

<!-- * [Tubeninja.Net](https://www.tubeninja.net/) -->
* [优酷视频解析](https://www.parsevideo.com/youku/)

## 使用

安裝：

```
npm install youku-m3u8-parser -g
```
or
```
yarn global add youku-m3u8-parser
```

將剛才下載的 m3u8 檔命名為 `我的影片.m3u8` (`我的影片` 為自訂影片名稱)。開啟命令行，執行：

```
youku-m3u8-parser --name "我的影片"
```

執行完成後，影片將會輸出至 `output` 資料夾中。

### 下載全部影片

解析當前資料夾全部的 m3u8 檔(不包含子資料夾)並下載影片：

```
youku-m3u8-parser --all
```

## 選項

```
  -n, --name <name>          影片名稱 (default: "video")
  -a, --all                  解析全部的 m3u8 檔並下載影片
  -m, --max <path>           同時下載的最大任務數 (default: 10)
  -q, --quantity <number>    輸出處理分組影片數。處理較大影片才需分組，例：輸入10，會先將10小段影片為單位合併為數個大段的影片後，再合併為完整的影片。 (default: 20)
  -f, --ffmpeg <path>        FFmpeg 路徑 (default: "ffmpeg")
```

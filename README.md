# 下載優酷影片小工具

解析 m3u8 檔、下載影片

> 參考：[优酷视频下载 - 『编程语言区』  - 吾爱破解](https://www.52pojie.cn/thread-571855-1-1.html)

> 僅支持 Windows

## 安裝依賴

* 安裝 [Node.js](https://nodejs.org/en/)
* 安裝 [FFmpeg](https://www.ffmpeg.org/download.html)

## 取得優酷影片 m3u8 檔

使用以下線上工具取得：

<!-- * [Tubeninja.Net](https://www.tubeninja.net/) -->
* [优酷视频解析](https://www.parsevideo.com/youku/)

## 使用

執行：

```
git clone git@github.com:ycs77/youku-m3u8-parser.git
cd youku-m3u8-parser
npm install
mkdir input
```

將剛才下載的 m3u8 檔移至 `input` 資料夾裡。命名為 `my-video.m3u8` (`my-video` 為自訂影片名稱)。

執行：

```
node ./bin/youku-m3u8-parser --name my-video
```

執行完成後，影片將會輸出至 `output` 資料夾中。

### 下載全部影片

解析全部的 m3u8 檔並下載影片：

```
node ./bin/youku-m3u8-parser --all
```

## 選項

```
  -n, --name <name>          影片名稱 (default: "video")
  -a, --all                  解析全部的 m3u8 檔並下載影片
  -m, --max <path>           同時下載的最大任務數 (default: 10)
  -q, --quantity <number>    輸出處理分組影片數，預設為0(不分組)。處理較大影片才需分組，例：輸入10，會先將10小段影片為單位合併為數個大段的影片後，再合併為完整的影片。 (default: 0)
  -f, --ffmpeg <path>        FFmpeg 路徑 (default: "ffmpeg")
```

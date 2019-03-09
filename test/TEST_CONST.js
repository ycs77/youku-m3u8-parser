const path = require('path')
const NAME = 'test'

function assetsPath(filename) {
  return path.resolve(__dirname, 'assets', filename)
}

module.exports = {
  NAME: NAME,
  FILE: `${NAME}.m3u8`,
  VIDEO: `${NAME}.mp4`,
  VIDEO_LIST: `${NAME}.video_list.js`,
  PATH: {
    FILE: assetsPath(`${NAME}.m3u8`),
    VIDEO: assetsPath(`${NAME}.mp4`),
    VIDEO_LIST: assetsPath(`${NAME}.video_list.js`)
  }
}

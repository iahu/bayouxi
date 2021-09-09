import Jimp from 'jimp'
import ffmpeg from 'fluent-ffmpeg'

import path from 'path'

import { all, run } from './db'
import ProHub from './prohub'

const captureFrame = (pathToVideo: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const folder = path.dirname(pathToVideo)
    const filename = path.basename(pathToVideo, path.extname(pathToVideo)) + '.png'
    ffmpeg(pathToVideo)
      .noAudio()
      .on('end', () => resolve(path.join(folder, filename)))
      .on('error', reject)
      .screenshot({
        count: 1,
        folder,
        filename,
      })
  })
}

const getPixelAspect = (pathToVideo: string): Promise<{ width?: number; height?: number }> => {
  return new Promise((resolve, reject) => {
    ffmpeg(pathToVideo).ffprobe((err, data) => {
      if (err) {
        return reject(err)
      }
      const { width = 0, height = 0 } = data.streams[0]
      resolve({ width, height })
    })
  })
}

const getThumnailHue = (pathToVideo: string) =>
  captureFrame(pathToVideo)
    .then(Jimp.read)
    .then((img) => img.scale(0.1))
    .then((img) => img.blur(40))
    .then((img) => img.getPixelColor(10, 10))
    .then(Jimp.intToRGBA)

type Video = { id: number; path: string }

const task = async (video: Video) => {
  const pathToVideo = path.join(__dirname, '..', 'assets', video.path)
  try {
    const { width, height } = await getPixelAspect(pathToVideo)
    const { r, g, b } = await getThumnailHue(pathToVideo)
    const hue = [r, g, b].map((t) => t.toString(16).padStart(2, '0')).join('')

    run('UPDATE assets SET width=?, height=?, hue=? WHERE id=?', [width, height, hue, video.id]).catch((err) => {
      console.error('处理失败', video.id, video.path, err)
      return err
    })
  } catch (e) {
    run('UPDATE assets set done=0 WHER id=?', [video.id])
    console.error(e)
    return e
  }
}

const main = async () => {
  const videos = await all<Video>('SELECT id, path FROM assets WHERE type="video" AND done=1')
  const tasks = videos.map((video) => () => task(video))
  new ProHub(tasks, 10).start()
}

main()

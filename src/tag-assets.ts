import osPath from 'path'
import fs from 'fs/promises'
import glob from 'glob'
import { all, run } from './db'
import { promisesThrottle } from './helper'

const readHeaderBytes = (path: string, byteLength: number): Promise<string> => {
  return fs
    .open(path, 'r')
    .then((fd) => {
      const buffer = Buffer.alloc(byteLength)
      const result = fd.read(buffer, 0, byteLength)
      fd.close()

      return result
    })
    .then(({ buffer }) => buffer.toString())
    .catch((e) => {
      if (e) {
        // loo.error('打开文件出错了', path, e)
        return e
      }
    })
}

const isImageFile = (path: string): Promise<boolean> => {
  return readHeaderBytes(path, 4).then((code) => code.slice(1, 4) === 'PNG')
}

const isVideoFile = (path: string): Promise<boolean> => {
  return readHeaderBytes(path, 12).then((code) => code.slice(4, 12) === 'ftypisom')
}

type Asset = { id: number; path: string; type: string }

const renameToHtml = async (filename: string) => {
  const extname = osPath.extname(filename)
  const basename = osPath.basename(filename, extname)
  const dirname = osPath.dirname(filename)
  const newname = osPath.join(dirname, `${basename}.html`)
  const fd = await fs.readFile(filename)
  fs.rm(filename)
  return await fs.writeFile(newname, fd)
}

const main = async () => {
  const list = await all<Asset>('SELECT id, path, type FROM assets WHERE done=0')
  const jobs = list.map((d) => async () => {
    const { id, path, type } = d
    const filename = osPath.join(__dirname, '../assets/', path)
    let result = false
    try {
      if (type === 'video') {
        result = await isVideoFile(filename)
      } else {
        result = await isImageFile(filename)
      }
      if (result) {
        run('UPDATE assets SET done=1 WHERE id=?', [id])
      }
      // else {
      //   renameToHtml(filename)
      // }
    } catch (e) {
      // console.log(e)
    }
  })

  promisesThrottle(jobs, 10)
}

const rm = () => {
  const imgPath = osPath.join(__dirname, '../assets/images/**/*.webp')
  const videoPath = osPath.join(__dirname, '../assets/videos/**/*.mp4')
  glob(imgPath, (err, matches) => {
    if (err) {
      console.log('images', err)
      return err
    }
    console.log('matches', matches.length)
    const jobs = matches.map(
      (m) => () =>
        isImageFile(m).then((r) => {
          if (!r) {
            renameToHtml(m)
          }
        })
    )
    promisesThrottle(jobs, 10)
  })

  glob(videoPath, (err, matches) => {
    if (err) {
      console.log('video', err)
      return err
    }
    console.log('matches', matches.length)
    const jobs = matches.map(
      (m) => () =>
        isVideoFile(m).then((r) => {
          if (!r) {
            renameToHtml(m)
          }
        })
    )
    promisesThrottle(jobs, 10)
  })
}

main()

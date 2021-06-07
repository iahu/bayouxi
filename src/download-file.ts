import fs from 'fs/promises'
import fetch from 'node-fetch'
import Path from 'path'
import { ensureDirectoryExistence } from './helper'
import loo from './loo'

const downloadFile = async (url: string, path: string): Promise<string | void> => {
  try {
    let f = await fetch(url)

    if (!f) {
      f = await fetch(url)
    }

    const buf = await f.buffer()

    const filePath = await ensureDirectoryExistence(Path.join(__dirname, '../assets', path))
    await fs.writeFile(filePath, buf, { flag: 'w', encoding: 'binary' })
    return path
  } catch (e) {
    loo.error('下载失败', e, url, path)
  }
}

export default downloadFile

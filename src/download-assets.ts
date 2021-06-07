import { all } from './db'
import downloadFile from './download-file'
import { parallelRun } from './helper'
import loo from './loo'

const [fromIndex = '0'] = process.argv.slice(2)

type Asset = { link: string; path: string; type: 'icon' | 'poster' | 'video' }
const downloadAssets = async (fromIndex = 0): Promise<void> => {
  const jobId = Date.now()
  const assets = await all<Asset>('SELECT link, path, type FROM assets', [])
  const jobs = assets.map((asset, idx) => {
    if (idx < fromIndex) {
      return () => Promise.resolve('ingore')
    }
    return () => downloadFile(asset.link, asset.path).catch((err) => loo.error('资源下载失败', err))
  })

  loo.log(`资源下载开始，共${jobs.length}个资源`, jobId)

  parallelRun(jobs, 32, (r, i) => {
    loo.info(`第${i}个任务结束`)
  })
    .then(() => {
      loo.log('资源下载结束', jobId)
    })
    .catch(loo.error)
}

downloadAssets(parseInt(fromIndex))

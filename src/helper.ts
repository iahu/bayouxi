import fs from 'fs/promises'
import Path from 'path'
import loo from './loo'

const memo = {} as Record<string, number>

export const ensureDirectoryExistence = (filePath: string): Promise<string> => {
  const dirname = Path.dirname(filePath)

  if (memo[dirname]) {
    return Promise.resolve(filePath)
  }

  return fs
    .access(dirname)
    .catch(() => fs.mkdir(dirname, { recursive: true }))
    .then(() => filePath)
    .finally(() => (memo[dirname] = 1))
}

export const getUid = (baseId = 0) => {
  return (base = 0): number => {
    baseId = baseId + 1
    return base + baseId
  }
}

export const uuid = (seed = 10000000000): number => {
  return Math.floor(Date.now() / (Math.random() * 100) + Math.random() * seed)
}

export const delay = (ms: number): Promise<number> => {
  return new Promise((resolve) => {
    return setTimeout(() => resolve(999), ms)
  })
}

export const pad = (n: number, length = 2): string => n.toString().padStart(length, '0')
export const getDatetime = (): string => {
  const date = new Date()
  const [y, m, d, H, M, S] = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((n) => pad(n, 2))
  const MS = pad(date.getMilliseconds(), 3)

  return `${[y, m, d].join('-')} ${[H, M, S].join(':')}.${MS}`
}

type Job<T> = () => Promise<T>
export const promisesThrottle = async <T>(
  jobs: Job<T>[],
  parallelCount: number,
  onParallelDone?: (results: T[], index: number) => void
): Promise<T[]> => {
  if (!(jobs && Array.isArray(jobs))) {
    return Promise.reject('jobs must be Array')
  }

  let result = [] as T[]
  for (let i = 0; i < jobs.length; i += parallelCount) {
    const parallelJobs = jobs.slice(i, i + parallelCount)
    result = await Promise.all(parallelJobs.map((j) => j()))
    onParallelDone?.(result, i)
  }

  return result
}

export const beforeExit = (fn?: (exitCode: number) => Promise<unknown>): void => {
  process.stdin.resume()
  function exitHandler(exitCode: number) {
    if (fn) {
      fn(exitCode).then(() => process.exit())
    } else {
      process.exit()
    }
  }
  //do something when app is closing
  process.on('exit', exitHandler)

  //catches ctrl+c event
  process.on('SIGINT', exitHandler)

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler)
  process.on('SIGUSR2', exitHandler)

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler)
}

type ListHistory = Record<number | string, number>
export const useListHistory = async (): Promise<ListHistory> => {
  const resumePath = Path.join(__dirname, '../resume.txt')

  const resume = await fs.readFile(resumePath, 'utf8')
  const listHistory = JSON.parse(resume || '{}')

  beforeExit(() => {
    const data = JSON.stringify(listHistory)
    loo.log('save list history', data)
    return fs.rm(resumePath).then(() => fs.writeFile(resumePath, data, { flag: 'w' }))
  })

  return listHistory
}

export const getNextListUrl = (url: string): string => {
  const urlObj = new URL(url)
  const urlList = urlObj.pathname.split('/').map((t) => t.split('.').shift())
  const pageNum = urlList[3] || '1'
  urlList[3] = +pageNum + 1 + '.html'

  urlObj.pathname = urlList.join('/')

  return urlObj.toString()
}

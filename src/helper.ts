import fs from 'fs/promises'
import Path from 'path'

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

let baseId = 1000000
export const uuid = (base = 0): number => {
  baseId = baseId + 1
  return base + baseId
}

export const getUuid =
  (baseId = 0) =>
  (base = 0): number => {
    baseId = baseId + 1
    return base + baseId
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

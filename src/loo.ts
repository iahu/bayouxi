import fs from 'fs/promises'
import path from 'path'
import { ensureDirectoryExistence, getDatetime } from './helper'

type LogTypes = keyof typeof console

const logCreator = (type: LogTypes) => {
  return (...args: unknown[]) => {
    const datetime = getDatetime()
    const date = datetime.split(' ').shift()
    const logPath = path.join(__dirname, '../logs/', `${type}-${date}.log`)
    const log = `[${type.toUpperCase()}] [${datetime}]: ${args.join(' ')}`

    ensureDirectoryExistence(logPath).then((path) => fs.writeFile(path, log + '\n', { flag: 'a' }))

    return console[type](log)
  }
}

const keys = ['log', 'info', 'error', 'debug'] as LogTypes[]

const loo = keys.reduce((acc, type) => {
  acc[type] = logCreator(type)

  return acc
}, {} as Record<LogTypes, ReturnType<typeof logCreator>>)

export default loo

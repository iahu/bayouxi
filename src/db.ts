import { verbose, RunResult, Statement } from 'sqlite3'
import { getDatetime } from './helper'
import loo from './loo'

const PRODUCTION = process.env.NODE_ENV === 'production'
const mainScript = process.argv[1]?.endsWith('index.ts')

const sqlite3 = verbose()
const ts = getDatetime().split(/\D/).slice(0, 4).join('.')
const dbName = PRODUCTION || !mainScript ? '233.db' : `233-${ts}.db`
const db = new sqlite3.Database(dbName)
loo.info('use Database from', dbName)

db.serialize(() => {
  // db.run('DROP TABLE IF EXISTS category', [])
  // db.run('DROP TABLE IF EXISTS category_l2', [])
  // db.run('DROP TABLE IF EXISTS game_info', [])
  // db.run('DROP TABLE IF EXISTS assets', [])
  // db.run('DROP TABLE IF EXISTS comments', [])

  db.run(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY,
    name TEXT,
    link TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS category_l2 (
    id INTEGER PRIMARY KEY,
    name TEXT,
    cate_name TEXT,
    cate_id INTEGER,
    link TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS game_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cate_id INTEGER,
    sub_cate_id INTEGER,
    score REAL,
    icon TEXT,
    tags TEXT,
    tagsName TEXT,
    images TEXT,
    videos TEXT,
    introduction TEXT,
    app_size TEXT,
    app_version TEXT,
    app_author TEXT,
    link TEXT,
    comment INTEGER,
    UNIQUE (id, name)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY,
    cate_id INTEGER,
    sub_cate_id INTEGER,
    type TEXT,
    path TEXT,
    alt TEXT,
    title TEXT,
    link TEXT,
    page_link TEXT,
    width INTEGER,
    height INTEGER,
    hue TEXT,
    done INTEGER
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment TEXT
  )`)
})

export const get = <T extends unknown>(sql: string, params?: unknown): Promise<T> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, rows) {
      if (err) {
        return reject(err)
      }
      resolve(rows)
    })
  })
}

export const all = <T extends unknown>(sql: string, params?: unknown): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) {
        return reject(err)
      }
      resolve(rows)
    })
  })
}

export const run = (sql: string, params?: unknown): Promise<RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(this)
    })
  })
}

export const prepare = (sql: string, params: unknown): Promise<Statement> => {
  return new Promise((resolve, reject) => {
    db.prepare(sql, params, function (err) {
      if (err) {
        return reject(err)
      }
      resolve(this)
    })
  })
}

export default db

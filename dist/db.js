"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = exports.run = exports.all = exports.get = void 0;
const sqlite3_1 = require("sqlite3");
const helper_1 = require("./helper");
const loo_1 = __importDefault(require("./loo"));
const PRODUCTION = process.env.NODE_ENV === 'production';
const sqlite3 = sqlite3_1.verbose();
const dbName = PRODUCTION ? '233.db' : `233-${helper_1.getDatetime()}.db`;
const db = new sqlite3.Database(dbName);
loo_1.default.info('use Database from', dbName);
db.serialize(() => {
    // db.run('DROP TABLE IF EXISTS category', [])
    // db.run('DROP TABLE IF EXISTS category_l2', [])
    // db.run('DROP TABLE IF EXISTS game_info', [])
    // db.run('DROP TABLE IF EXISTS assets', [])
    db.run(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY,
    name TEXT,
    link TEXT
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS category_l2 (
    id INTEGER PRIMARY KEY,
    name TEXT,
    cate_name TEXT,
    cate_id INTEGER,
    link TEXT
  )`);
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
    UNIQUE (id, name)
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY,
    cate_id INTEGER,
    sub_cate_id INTEGER,
    type TEXT,
    path TEXT,
    alt TEXT,
    title TEXT,
    link TEXT,
    page_link TEXT
  )`);
});
const get = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, function (err, rows) {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};
exports.get = get;
const all = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, function (err, rows) {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};
exports.all = all;
const run = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this);
        });
    });
};
exports.run = run;
const prepare = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.prepare(sql, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this);
        });
    });
};
exports.prepare = prepare;
exports.default = db;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
const loo_1 = __importDefault(require("./loo"));
const debug = false;
const parser = (url, retryTimes = 0) => {
    const after = Date.now();
    return node_fetch_1.default(url)
        .then((t) => {
        debug && loo_1.default.debug('花了', Date.now() - after, url);
        return t;
    })
        .then((t) => t.text())
        .then(cheerio_1.default.load)
        .catch((err) => {
        if (retryTimes > 3) {
            loo_1.default.error('parser error', url, err);
            return;
        }
        loo_1.default.info(retryTimes, 'times retry to parse', url);
        return parser(url, retryTimes + 1);
    });
};
exports.default = parser;

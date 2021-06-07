"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("./helper");
const loo_1 = __importDefault(require("./loo"));
const downloadFile = async (url, path) => {
    try {
        let f = await node_fetch_1.default(url);
        if (!f) {
            f = await node_fetch_1.default(url);
        }
        const buf = await f.buffer();
        const filePath = await helper_1.ensureDirectoryExistence(path_1.default.join(__dirname, '../assets', path));
        await promises_1.default.writeFile(filePath, buf, { flag: 'w', encoding: 'binary' });
        return path;
    }
    catch (e) {
        loo_1.default.error('下载失败', e, url, path);
    }
};
exports.default = downloadFile;

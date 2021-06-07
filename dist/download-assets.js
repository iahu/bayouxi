"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const download_file_1 = __importDefault(require("./download-file"));
const helper_1 = require("./helper");
const loo_1 = __importDefault(require("./loo"));
const [fromIndex = '0'] = process.argv.slice(2);
const downloadAssets = async (fromIndex = 0) => {
    const jobId = Date.now();
    const assets = await db_1.all('SELECT link, path, type FROM assets', []);
    const jobs = assets.map((asset, idx) => {
        if (idx < fromIndex) {
            return () => Promise.resolve('ingore');
        }
        return () => download_file_1.default(asset.link, asset.path).catch((err) => loo_1.default.error('资源下载失败', err));
    });
    loo_1.default.log(`资源下载开始，共${jobs.length}个资源`, jobId);
    helper_1.parallelRun(jobs, 32, (r, i) => {
        loo_1.default.info(`第${i}个任务结束`);
    })
        .then(() => {
        loo_1.default.log('资源下载结束', jobId);
    })
        .catch(loo_1.default.error);
};
downloadAssets(parseInt(fromIndex));

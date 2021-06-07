"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallelRun = exports.getDatetime = exports.pad = exports.delay = exports.getUuid = exports.uuid = exports.ensureDirectoryExistence = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const memo = {};
const ensureDirectoryExistence = (filePath) => {
    const dirname = path_1.default.dirname(filePath);
    if (memo[dirname]) {
        return Promise.resolve(filePath);
    }
    return promises_1.default
        .access(dirname)
        .catch(() => promises_1.default.mkdir(dirname, { recursive: true }))
        .then(() => filePath)
        .finally(() => (memo[dirname] = 1));
};
exports.ensureDirectoryExistence = ensureDirectoryExistence;
let baseId = 1000000;
const uuid = (base = 0) => {
    baseId = baseId + 1;
    return base + baseId;
};
exports.uuid = uuid;
const getUuid = (baseId = 100000) => (base = 0) => {
    baseId = baseId + 1;
    return base + baseId;
};
exports.getUuid = getUuid;
const delay = (ms) => {
    return new Promise((resolve) => {
        return setTimeout(() => resolve(999), ms);
    });
};
exports.delay = delay;
const pad = (n, length = 2) => n.toString().padStart(length, '0');
exports.pad = pad;
const getDatetime = () => {
    const date = new Date();
    const [y, m, d, H, M, S] = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    ].map((n) => exports.pad(n, 2));
    const MS = exports.pad(date.getMilliseconds(), 3);
    return `${[y, m, d].join('-')} ${[H, M, S].join(':')}.${MS}`;
};
exports.getDatetime = getDatetime;
const parallelRun = async (jobs, parallelCount, onParallelDone) => {
    if (!(jobs && Array.isArray(jobs))) {
        return Promise.reject('jobs must be Array');
    }
    let result = [];
    for (let i = 0; i < jobs.length; i += parallelCount) {
        const parallelJobs = jobs.slice(i, i + parallelCount);
        result = await Promise.all(parallelJobs.map((j) => j()));
        onParallelDone?.(result, i);
    }
    return result;
};
exports.parallelRun = parallelRun;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("./helper");
const logCreator = (type) => {
    return (...args) => {
        const datetime = helper_1.getDatetime();
        const date = datetime.split(' ').shift();
        const logPath = path_1.default.join(__dirname, '../logs/', `${type}-${date}.log`);
        const log = `[${type.toUpperCase()}] [${datetime}]: ${args.join(' ')}`;
        helper_1.ensureDirectoryExistence(logPath).then((path) => promises_1.default.writeFile(path, log + '\n', { flag: 'a' }));
        return console[type](log);
    };
};
const keys = ['log', 'info', 'error', 'debug'];
const loo = keys.reduce((acc, type) => {
    acc[type] = logCreator(type);
    return acc;
}, {});
exports.default = loo;

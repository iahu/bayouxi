"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __importDefault(require("./parser"));
const countCate = (url) => {
    return parser_1.default(url).then(($) => {
        if (!$) {
            return 0;
        }
        const pager = $('.m-pager li').last()?.text() || '1';
        return +pager * 30;
    });
};
exports.default = countCate;

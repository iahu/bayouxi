"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loo_1 = __importDefault(require("./loo"));
const parser_1 = __importDefault(require("./parser"));
const helper_1 = require("./helper");
const throughList = async (url, subCateId, getPageInfo) => {
    const start = Date.now();
    return parser_1.default(url).then(($) => {
        if (!$) {
            return loo_1.default.error('list 解析失败', url, subCateId);
        }
        const pipes = [];
        const pageNum = +$('.m-pager-number.active').text().trim();
        loo_1.default.log(`解析第${subCateId},${pageNum}页`, url);
        $('.list .item')
            .toArray()
            .forEach((el, i) => {
            const $el = $(el);
            const link = $el.find('.game_img').attr('href');
            // 这里并行就可以了，顺序不重要
            pipes.push(getPageInfo(link, i));
        });
        const activePager = $('.m-pager-number.active');
        const activeNext = activePager.next('.m-pager-number');
        const nextPagePath = activeNext?.find('a').attr('href');
        if (!nextPagePath) {
            loo_1.default.log(`解析完${subCateId}, 共${pageNum}页, 花费 ${Date.now() - start}`);
            return 1;
        }
        // 详情页都跑完了再跑下一页
        Promise.race([helper_1.delay(2000), Promise.all(pipes)]).then(() => {
            loo_1.default.log(`已跑完${subCateId}, 第${pageNum}页`);
            throughList(`https://www.233leyuan.com${nextPagePath}`, subCateId, getPageInfo);
        });
    });
};
exports.default = throughList;

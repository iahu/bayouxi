"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const category_1 = __importDefault(require("./category"));
const page_1 = __importDefault(require("./page"));
const loo_1 = __importDefault(require("./loo"));
const list_1 = __importDefault(require("./list"));
const [startCateIndex = '0', startPageIndex = '0'] = process.argv.slice(2);
const fromCateIndex = parseInt(startCateIndex) || 0;
const fromPageIndex = parseInt(startPageIndex) || 0;
const jobId = Date.now();
const main = async (fromCateIndex, fromPageIndex) => {
    const subCategory = await category_1.default();
    const cateLength = subCategory.length;
    const listJobs = [];
    subCategory.forEach((subCate, cateIdx) => {
        if (cateIdx < fromCateIndex) {
            return;
        }
        listJobs.push(() => {
            loo_1.default.log('分类开始', `${cateIdx + 1}/${cateLength}`, subCate.cate_name);
            return list_1.default(subCate.link, subCate.id, (pageLink, pageIdx) => {
                if (pageIdx < fromPageIndex) {
                    return Promise.resolve(null);
                }
                // loo.log('获取游戏信息', `(${cateIdx + 1}/${cateLength}类, ${pageIdx + 1}个)[${pageLink}]`)
                return page_1.default(pageLink, subCate.cate_id, subCate.id);
            }).then((r) => {
                loo_1.default.log('分类结束', `${cateIdx + 1}/${cateLength}`, subCate.cate_name);
                return r;
            });
        });
    });
    helper_1.parallelRun(listJobs, 42).then(() => {
        loo_1.default.log('任务结束', jobId, '耗时', Date.now() - jobId);
    });
};
loo_1.default.log('任务开始', jobId);
main(fromCateIndex, fromPageIndex);

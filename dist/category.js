"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importStar(require("./db"));
const helper_1 = require("./helper");
const loo_1 = __importDefault(require("./loo"));
const parser_1 = __importDefault(require("./parser"));
const uuid = helper_1.getUuid(0);
const getCategory = async () => {
    const rows = (await db_1.all('SELECT * FROM category_l2', []));
    if (rows.length) {
        return Promise.resolve(rows);
    }
    const $ = await parser_1.default('https://www.233leyuan.com/find/');
    if (!$) {
        return loo_1.default.error('category 解析失败');
    }
    const category = $('.nava_box a')
        .toArray()
        .reduce((acc, el, id) => {
        const name = el.attribs.title.trim();
        const link = el.attribs.href;
        db_1.default.run('INSERT INTO category (id, name, link) VALUES (?, ?, ?)', [id, name, link]);
        acc[name] = id;
        return acc;
    }, {});
    const subCategory = $('.swiper-slide .item')
        .toArray()
        .reduce((acc, item) => {
        const cate_name = $('.item_tit', item).text().trim();
        const subCategory = $('.item_a a', item)
            .toArray()
            .map((a) => {
            const name = a.attribs.title.trim();
            const link = a.attribs.href;
            const cate_id = category[cate_name];
            const id = uuid();
            db_1.run('INSERT INTO category_l2 (id, name, link, cate_id, cate_name) VALUES (?, ?, ?, ?, ?)', [
                id,
                name,
                link,
                cate_id,
                cate_name,
            ]);
            return { id, name, link, cate_id, cate_name };
        });
        acc = acc.concat(subCategory);
        return acc;
    }, []);
    return subCategory;
};
exports.default = getCategory;

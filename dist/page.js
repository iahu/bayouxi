"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const helper_1 = require("./helper");
const loo_1 = __importDefault(require("./loo"));
const parser_1 = __importDefault(require("./parser"));
const uuid = helper_1.getUuid(0);
const getPageInfo = async (url, cateId, subCateId) => {
    const $ = await parser_1.default(url);
    if (!$) {
        return loo_1.default.error('page 解析失败', url, subCateId);
    }
    const $gameInfo = $('.game');
    const link = url;
    const name = $gameInfo.find('h1').text().trim();
    const score = +$('.rate_container .score_num').text().trim();
    const introduction = $('.brief-inf').text().trim();
    const $appInfo = $('.detailed-ul li span:nth-child(2)');
    const [app_size, app_version, app_author] = $appInfo.toArray().map((el) => $(el).text().trim());
    const tagsName = $('.tags a')
        .toArray()
        .map((e) => $(e).text());
    const getImageInfo = (type) => (el) => {
        const alt = el.attribs.alt?.trim() || name;
        const title = el.attribs.title?.trim() || name;
        const url = el.attribs['data-src'];
        const { pathname } = new URL(url);
        const basename = path_1.default.basename(pathname);
        const id = uuid();
        const path = path_1.default.join('images', subCateId.toString(), basename);
        return { id, url, alt, title, path, type };
    };
    const iconList = $('#pic-h', $gameInfo).toArray().map(getImageInfo('icon'));
    const imageList = $('#publicity_img img').toArray().map(getImageInfo('poster'));
    const videoList = $('#publicity_video video')
        .toArray()
        .map((el) => {
        const url = el.attribs.src;
        const { pathname } = new URL(url);
        const basename = path_1.default.basename(pathname);
        const id = uuid();
        const path = path_1.default.join('videos', subCateId.toString(), basename);
        return { id, url, path, alt: name, title: name, type: 'video' };
    });
    const icons = iconList.map((d) => d.id).join(',');
    const images = imageList.map((d) => d.id).join(',');
    const videos = videoList.map((d) => d.id).join(',');
    // loo.debug('插入游戏信息', name, link)
    db_1.run('INSERT INTO game_info (link, name, cate_id, sub_cate_id, score, introduction, tagsName, icon, images, videos, app_size, app_version, app_author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        link,
        name,
        cateId,
        subCateId,
        score,
        introduction,
        tagsName,
        icons,
        images,
        videos,
        app_size,
        app_version,
        app_author,
    ]).then(() => {
        // loo.debug('插入资源信息', name, link)
        ;
        [...iconList, ...imageList, ...videoList].forEach(({ id, url, path, alt, title, type }) => {
            // 暂时不下载文件了，数据量太大，会卡死
            // downloadFile(url, path)
            Promise.resolve(url)
                .then(() => db_1.run('INSERT INTO assets (id, cate_id, sub_cate_id, type, path, alt, title, link, page_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, cateId, subCateId, type, path, alt, title, url, link]))
                .catch((err) => {
                loo_1.default.error(err, name, url);
            });
        });
    });
    return {
        iconList,
        imageList,
        videoList,
        link,
        name,
        score,
        introduction,
        tagsName,
        app_size,
        app_version,
        app_author,
    };
};
exports.default = getPageInfo;

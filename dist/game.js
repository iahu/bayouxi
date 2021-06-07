"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var db_1 = require("./db");
var helper_1 = require("./helper");
var loo_1 = __importDefault(require("./loo"));
var parser_1 = __importDefault(require("./parser"));
var getGameInfo = function (url, cateId, name2CateId) { return __awaiter(void 0, void 0, void 0, function () {
    var $, $gameInfo, link, name, score, introduction, $appInfo, _a, app_size, app_version, app_author, tagsName, tags, getImageInfo, icons, images, imagesId, videos, videosId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, parser_1.default(url)];
            case 1:
                $ = _b.sent();
                $gameInfo = $('.game');
                link = url;
                name = $gameInfo.find('h1').text().trim();
                score = +$('.rate_container .score_num').text().trim();
                introduction = $('.brief-inf').text().trim();
                $appInfo = $('.detailed-ul li span:nth-child(2)');
                _a = $appInfo.toArray().map(function (el) { return $(el).text().trim(); }), app_size = _a[0], app_version = _a[1], app_author = _a[2];
                tagsName = $('.tags a')
                    .toArray()
                    .map(function (e) { return $(e).text(); });
                tags = tagsName.map(function (e) { return name2CateId[e]; }).join(',');
                getImageInfo = function (el) {
                    var _a, _b;
                    var alt = ((_a = el.attribs.alt) === null || _a === void 0 ? void 0 : _a.trim()) || name;
                    var title = ((_b = el.attribs.title) === null || _b === void 0 ? void 0 : _b.trim()) || name;
                    var url = el.attribs['data-src'];
                    var pathname = new URL(url).pathname;
                    var basename = path_1.default.basename(pathname);
                    var id = helper_1.uuid();
                    var path = path_1.default.join('images', cateId.toString(), basename);
                    return { id: id, url: url, alt: alt, title: title, path: path };
                };
                icons = $('#pic-h', $gameInfo).toArray().map(getImageInfo);
                images = $('#publicity_img img').toArray().map(getImageInfo);
                imagesId = images.map(function (i) { return i.id; }).join(',');
                videos = $('#publicity_video video')
                    .toArray()
                    .map(function (el) {
                    var url = el.attribs.src;
                    var pathname = new URL(url).pathname;
                    var basename = path_1.default.basename(pathname);
                    var id = helper_1.uuid();
                    var path = path_1.default.join('videos', cateId.toString(), basename);
                    return { id: id, url: url, path: path, alt: name, title: name };
                });
                videosId = videos.map(function (v) { return v.id; }).join(',');
                // loo.log('插入游戏信息', name, link)
                // loo.info('run before')
                db_1.run('INSERT INTO game_info (link, name, score, introduction, tags, tagsName, images, videos, app_size, app_version, app_author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [link, name, score, introduction, tags, tagsName, imagesId, videosId, app_size, app_version, app_author]).then(function () {
                    // loo.info('run after')
                    ;
                    __spreadArray(__spreadArray(__spreadArray([], icons), images), videos).forEach(function (_a) {
                        var id = _a.id, url = _a.url, path = _a.path, alt = _a.alt, title = _a.title;
                        // 暂时不下载文件了，数据量太大，会卡死
                        // downloadFile(url, path)
                        Promise.resolve(url)
                            .then(function () {
                            return db_1.run('INSERT INTO assets (id, path, alt, title, link) VALUES (?, ?, ?, ?, ?)', [id, path, alt, title, link]);
                        })
                            .catch(function (err) {
                            loo_1.default.error(err);
                            loo_1.default.info('下载失败', name, url);
                        });
                    });
                });
                return [2 /*return*/];
        }
    });
}); };
exports.default = getGameInfo;

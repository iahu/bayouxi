"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var events_1 = __importDefault(require("events"));
var ProHub = /** @class */ (function (_super) {
    __extends(ProHub, _super);
    function ProHub(jobs, hubSize) {
        var _this = _super.call(this) || this;
        _this.eventJobs = [];
        _this.runningJobs = [];
        _this.jobMapping = function (job, index) {
            return function () {
                var eventJobs = _this.eventJobs;
                var runningJobs = _this.runningJobs;
                return job().then(function (res) {
                    var idx = runningJobs.findIndex(job);
                    var next = eventJobs.shift();
                    if (next) {
                        runningJobs[idx] = next;
                    }
                    else {
                        runningJobs.splice(idx, 1);
                    }
                    var data = { value: res, index: index, next: next === null || next === void 0 ? void 0 : next(), done: !next };
                    _this.emit('shift', data);
                    if (runningJobs.length === 0) {
                        _this.emit('done', data);
                    }
                    return res;
                });
            };
        };
        _this.jobCount = jobs.length;
        _this.eventJobs = jobs.map(_this.jobMapping);
        _this.hubSize = hubSize;
        return _this;
    }
    ProHub.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var eventJobs, runningJobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventJobs = this.eventJobs;
                        this.runningJobs = eventJobs.splice(0, this.hubSize);
                        runningJobs = this.runningJobs;
                        return [4 /*yield*/, Promise.all(runningJobs.map(function (j) { return j(); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProHub.prototype.push = function (job) {
        this.jobCount += 1;
        return this.eventJobs.push(this.jobMapping(job, this.jobCount));
    };
    ProHub.prototype.pop = function () {
        this.jobCount -= 1;
        return this.eventJobs.pop();
    };
    return ProHub;
}(events_1["default"]));
exports["default"] = ProHub;

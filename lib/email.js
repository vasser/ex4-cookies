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
var sgMail = require("@sendgrid/mail");
var fs = require("fs");
var Email = /** @class */ (function () {
    function Email(config) {
        this.apiKey = config.apiKey;
        this.domain = config.domain;
        this.fromEmail = config.fromEmail;
    }
    /**
     * @param {Object} msg - Sendgrid's message settings
     * @param {Object} msgData - Placeholders to replace in templates, eg: __iamplaceholder__: value
     * @param {*} user - user doc, combined with it's settings doc
     */
    Email.prototype.sendEmail = function (msg, msgData, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user)
                            throw new Error('User data is required');
                        if (user.settings && !user.settings.emails.send) {
                            throw new Error("User " + user._id + " unsubscribed");
                        }
                        this._normalizeMsg(msg, msgData, user);
                        sgMail.setApiKey(this.apiKey);
                        return [4 /*yield*/, sgMail.send(msg)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Email.prototype.getTemplate = function (name) {
        var path = __dirname + "/../templates/emails/" + name + ".html";
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf-8');
        }
    };
    Email.prototype._normalizeMsg = function (msg, msgData, user) {
        msg.from = this.fromEmail;
        msg.replyTo = this.fromEmail;
        // if we want to disable bcc = set it to false;
        // if nothing will be passed to bcc it will accept default value
        if (!msg.bcc && msg.bcc !== false)
            msg.bcc = this.fromEmail;
        this._replacePlaceholders(msg, msgData, user);
    };
    Email.prototype._replacePlaceholders = function (msg, msgData, user) {
        msgData.__domain__ = this.domain;
        msgData.__unsubscribe__ = this.domain + "/unsubscribe/" + user._id;
        if (!msgData.__email__)
            msgData.__email__ = msg.to;
        var re = new RegExp(Object.keys(msgData).join('|'), 'gi');
        msg.html = msg.html.replace(re, function (matched) { return msgData[matched]; });
    };
    return Email;
}());
module.exports = Email;

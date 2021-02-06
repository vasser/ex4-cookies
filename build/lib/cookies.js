"use strict";
var mcrypt_1 = require("mcrypt");
var luxon_1 = require("luxon");
var rijnDeal256Ecb = new mcrypt_1.MCrypt('rijndael-256', 'ecb');
var Cookies = /** @class */ (function () {
    function Cookies(config) {
        var _a, _b;
        this.maxAge = config.cookies.maxAge;
        this.key = config.cookies.key;
        this.domain = config.cookies.domain;
        this.secure = ((_a = config.cookies) === null || _a === void 0 ? void 0 : _a.secure) || false;
        this.sameSite = ((_b = config.cookies) === null || _b === void 0 ? void 0 : _b.sameSite) || false;
        this.secretKey = config.cookies.secretKey;
        this.loginPage = config.client.loginPage;
        this.expiredPage = config.client.expiredPage;
    }
    Cookies.prototype.createCookie = function (ctx, user) {
        var expires = user.status === 'trial'
            ? user.endOfTrialPeriod
            : luxon_1.DateTime.utc()
                .plus({ milliseconds: this.maxAge })
                .toString();
        var value = this.encodeCookieValue(user, expires);
        ctx.cookies.set(this.key, value, {
            maxAge: this.maxAge,
            expires: expires,
            domain: this.domain,
            secure: this.secure,
            sameSite: this.sameSite,
            overwrite: true,
        });
    };
    Cookies.prototype.deleteCookie = function (ctx) {
        ctx.cookies.set(this.key, null, { domain: this.domain });
    };
    Cookies.prototype.isCookieValid = function (ctx) {
        var cookie = ctx.cookies.get(this.key);
        var now = Date.now();
        try {
            var user = JSON.parse(this.decodeCookieValue(cookie));
            if (user.status === 'expired') {
                return this.expiredPage;
            }
            else if (new Date(user.expireDate) < new Date(now) && user.status === 'trial') {
                return this.expiredPage;
            }
            else if (user.status === 'active' && user.email) {
                if (new Date(user.expireDate) > new Date(now))
                    return true;
            }
            else {
                throw new Error();
            }
        }
        catch (e) {
            return this.loginPage;
        }
    };
    Cookies.prototype.readCookie = function (ctx) {
        var cookie = ctx.cookies.get(this.key);
        try {
            var value = JSON.parse(this.decodeCookieValue(cookie));
            return value;
        }
        catch (e) {
            return false;
        }
    };
    Cookies.prototype.encodeCookieValue = function (user, expireDate) {
        var _id = user._id, _a = user.fullname, fullname = _a === void 0 ? '' : _a, email = user.email, status = user.status, personalDetails = user.personalDetails, _b = user.role, role = _b === void 0 ? 'client' : _b, _c = user.showOnboarding, showOnboarding = _c === void 0 ? false : _c;
        var userData = {
            _id: _id,
            fullname: fullname,
            email: email,
            role: role,
            status: status,
            showOnboarding: showOnboarding,
            personalDetails: personalDetails,
            timestamp: Date.now() / 1000,
            expireDate: expireDate,
        };
        rijnDeal256Ecb.open(this.secretKey);
        return rijnDeal256Ecb.encrypt(JSON.stringify(userData)).toString('base64');
    };
    Cookies.prototype.decodeCookieValue = function (decodeThis) {
        rijnDeal256Ecb.open(this.secretKey);
        return rijnDeal256Ecb
            .decrypt(Buffer.from(decodeThis, 'base64'))
            .toString()
            .replace(/\0/g, '');
    };
    return Cookies;
}());
module.exports = Cookies;

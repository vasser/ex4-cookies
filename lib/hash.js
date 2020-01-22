"use strict";
var lodash_1 = require("lodash");
var mcrypt_1 = require("mcrypt");
var rijnDeal256Ecb = new mcrypt_1.MCrypt('rijndael-256', 'ecb');
var ENC = 'base64';
var Hash = /** @class */ (function () {
    function Hash() {
    }
    Hash.prototype.hashData = function (data, key) {
        rijnDeal256Ecb.open(key);
        var dataToHash = data;
        if (!lodash_1.isString(dataToHash))
            dataToHash = JSON.stringify(dataToHash);
        return rijnDeal256Ecb.encrypt(dataToHash).toString(ENC);
    };
    Hash.prototype.deHashData = function (hash, key) {
        rijnDeal256Ecb.open(key);
        return rijnDeal256Ecb
            .decrypt(Buffer.from(hash, ENC))
            .toString()
            .replace(/\0/g, '');
    };
    return Hash;
}());
module.exports = Hash;

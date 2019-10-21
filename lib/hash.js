const { isString } = require("lodash");
const MCrypt = require("mcrypt").MCrypt;
const rijnDeal256Ecb = new MCrypt("rijndael-256", "ecb");

const ENC = "base64";

module.exports = class Hash {
  hashData(data, key) {
    rijnDeal256Ecb.open(key);
    let dataToHash = data;
    if (!isString(dataToHash)) dataToHash = JSON.stringify(dataToHash);
    return rijnDeal256Ecb.encrypt(dataToHash).toString(ENC);
  }

  deHashData(hash, key) {
    rijnDeal256Ecb.open(key);
    return rijnDeal256Ecb
      .decrypt(new Buffer.from(hash, ENC))
      .toString()
      .replace(/\0/g, "");
  }
};

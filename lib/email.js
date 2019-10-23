const sgMail = require("@sendgrid/mail");

module.exports = class Email {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.domain = config.domain;
    this.fromEmail = config.fromEmail;
  }

  async sendEmail(msg, msgData) {
    this._normalizeMsg(msg, msgData);
    sgMail.setApiKey(this.apiKey);
    try {
      await sgMail.send(msg);
    } catch (e) {
      throw e;
    }
  }

  _normalizeMsg(msg, msgData) {
    msg.from = this.fromEmail;
    this._replacePlaceholders(msg, msgData);
  }

  _replacePlaceholders(msg, msgData = {}) {
    msgData["__domain__"] = this.domain;
    if (!msgData["__email__"]) msgData["__email__"] = msg.to;

    const re = new RegExp(Object.keys(msgData).join("|"), "gi");
    msg.html = msg.html.replace(re, matched => msgData[matched]);
  }
};

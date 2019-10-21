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
    await sgMail.send(msg);
  }

  _normalizeMsg(msg, msgData) {
    msg.from = this.fromEmail;
    this._replacePlaceholders(msg, msgData);
  }

  _replacePlaceholders(msg, msgData = {}) {
    msgData["__domain__"] = this.domain;
    const re = new RegExp(Object.keys(msgData).join("|"), "gi");
    msg.html = msg.html.replace(re, matched => msgData[matched]);
  }
};

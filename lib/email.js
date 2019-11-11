const sgMail = require("@sendgrid/mail");
const fs = require("fs");

module.exports = class Email {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.domain = config.domain;
    this.fromEmail = config.fromEmail;
  }

  async sendEmail(msg, msgData, user = {}) {
    if (!user) throw new UserError("User data is required");
    if (user.settings && !user.settings[0].emails.send)
      throw new UserError(`User ${user._id} unsubscribed`);
    this._normalizeMsg(msg, msgData, user);
    sgMail.setApiKey(this.apiKey);
    try {
      await sgMail.send(msg);
    } catch (e) {
      throw e;
    }
  }

  getTemplate(name) {
    const path = `${__dirname}/../templates/emails/${name}.html`;
    if (fs.existsSync(path)) {
      return fs.readFileSync(path, "utf-8");
    }
    return;
  }

  _normalizeMsg(msg, msgData, user) {
    msg.from = this.fromEmail;
    msg.replyTo = this.fromEmail;
    msg.bcc = this.fromEmail;
    this._replacePlaceholders(msg, msgData, user);
  }

  _replacePlaceholders(msg, msgData = {}, user) {
    msgData["__domain__"] = this.domain;
    msgData["__unsubscribe__"] = `${this.domain}/unsubscribe/${user._id}`;
    if (!msgData["__email__"]) msgData["__email__"] = msg.to;

    const re = new RegExp(Object.keys(msgData).join("|"), "gi");
    msg.html = msg.html.replace(re, matched => msgData[matched]);
  }
};

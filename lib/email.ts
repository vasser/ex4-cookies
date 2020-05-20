import sgMail = require('@sendgrid/mail');
import fs = require('fs');

interface Config {
    apiKey: string;
    domain: string;
    fromEmail: string;
}

interface User {
    _id: object;
    settings: UserSettings;
}

interface UserSettings {
    emails: EmailSettings;
}

interface EmailSettings {
    send: boolean;
}

interface MessageData {
    __domain__?: string;
    __email__?: string;
    __unsubscribe__?: string;
    [propName: string]: any;
}

class Email {
    apiKey: string;
    domain: string;
    fromEmail: string;

    constructor(config: Config) {
        this.apiKey = config.apiKey;
        this.domain = config.domain;
        this.fromEmail = config.fromEmail;
    }

    /**
     * @param {Object} msg - Sendgrid's message settings
     * @param {Object} msgData - Placeholders to replace in templates, eg: __iamplaceholder__: value
     * @param {*} user - user doc, combined with it's settings doc
     */
    async sendEmail(msg, msgData, user: User): Promise<void> {
        if (!user) throw new Error('User data is required');
        if (user.settings && !user.settings.emails.send) {
            throw new Error(`User ${user._id} unsubscribed`);
        }
        this._normalizeMsg(msg, msgData, user);
        sgMail.setApiKey(this.apiKey);
        await sgMail.send(msg);
    }

    getTemplate(name: string): string | null {
        const path = `../templates/emails/${name}.html`;
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf-8');
        }
    }

    _normalizeMsg(msg, msgData, user: User): void {
        msg.from = this.fromEmail;
        msg.replyTo = this.fromEmail;
        // if we want to disable bcc = set it to false;
        // if nothing will be passed to bcc it will accept default value
        if (!msg.bcc && msg.bcc !== false) msg.bcc = this.fromEmail;
        this._replacePlaceholders(msg, msgData, user);
    }

    _replacePlaceholders(msg, msgData: MessageData, user: User): void {
        msgData.__domain__ = this.domain;
        msgData.__unsubscribe__ = `${this.domain}/unsubscribe/${user._id}`;
        if (!msgData.__email__) msgData.__email__ = msg.to;

        const re = new RegExp(Object.keys(msgData).join('|'), 'gi');
        msg.html = msg.html.replace(re, matched => msgData[matched]);
    }
}

export = Email;

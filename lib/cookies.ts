import { MCrypt } from 'mcrypt';
import { DateTime } from 'luxon';
import { DefaultContext } from 'koa';

import { Config, UserCookies as User } from './types';

const rijnDeal256Ecb = new MCrypt('rijndael-256', 'ecb');

class Cookies {
    maxAge: number;
    key: string;
    domain: string;
    secure: boolean;
    sameSite: boolean;
    secretKey: string;
    loginPage: string;
    expiredPage: string;

    constructor(config: Config) {
        this.maxAge = config.cookies.maxAge;
        this.key = config.cookies.key;
        this.domain = config.cookies.domain;
        this.secure = config.cookies?.secure || false;
        this.sameSite = config.cookies?.sameSite || false;
        this.secretKey = config.cookies.secretKey;
        this.loginPage = config.client.loginPage;
        this.expiredPage = config.client.expiredPage;
    }

    createCookie(ctx: any, user: User): void {
        const expires =
            user.status === 'trial'
                ? user.endOfTrialPeriod
                : DateTime.utc()
                      .plus({ milliseconds: this.maxAge })
                      .toString();
        const value = this.encodeCookieValue(user, expires);
        ctx.cookies.set(this.key, value, {
            maxAge: this.maxAge,
            expires,
            domain: this.domain,
            secure: this.secure,
            sameSite: this.sameSite,
            overwrite: true,
        });
    }

    deleteCookie(ctx: DefaultContext): void {
        ctx.cookies.set(this.key, null, { domain: this.domain });
    }

    isCookieValid(ctx: DefaultContext): string | boolean | never {
        const cookie: string = ctx.cookies.get(this.key);
        const now: number = Date.now();
        try {
            const user: User = JSON.parse(this.decodeCookieValue(cookie));
            if (user.status === 'expired') {
                return this.expiredPage;
            } else if (new Date(user.expireDate) < new Date(now) && user.status === 'trial') {
                return this.expiredPage;
            } else if (user.status === 'active' && user.email) {
                if (new Date(user.expireDate) > new Date(now)) return true;
            } else {
                throw new Error();
            }
        } catch (e) {
            return this.loginPage;
        }
    }

    readCookie(ctx: DefaultContext): object | boolean {
        const cookie: string = ctx.cookies.get(this.key);
        try {
            const value: object = JSON.parse(this.decodeCookieValue(cookie));
            return value;
        } catch (e) {
            return false;
        }
    }

    encodeCookieValue(user: User, expireDate): string {
        const { _id, fullname = '', email, status, personalDetails, role = 'client', showOnboarding = false } = user;
        const userData = {
            _id,
            fullname,
            email,
            role,
            status,
            showOnboarding,
            personalDetails,
            timestamp: Date.now() / 1000,
            expireDate,
        };

        rijnDeal256Ecb.open(this.secretKey);

        return rijnDeal256Ecb.encrypt(JSON.stringify(userData)).toString('base64');
    }

    decodeCookieValue(decodeThis: string): string {
        rijnDeal256Ecb.open(this.secretKey);
        return rijnDeal256Ecb
            .decrypt(Buffer.from(decodeThis, 'base64'))
            .toString()
            .replace(/\0/g, '');
    }
}

export = Cookies;

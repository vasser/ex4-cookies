const moment = require('moment')
const { get } = require('lodash')
const MCrypt = require('mcrypt').MCrypt
const rijnDeal256Ecb = new MCrypt('rijndael-256', 'ecb')

module.exports = class Cookies {
  constructor(config = {}) {
    this.maxAge = get(config, 'cookies.maxAge')
    this.key = get(config, 'cookies.key')
    this.domain = get(config, 'cookies.domain')
    this.secretKey = get(config, 'cookies.secretKey')
    this.loginPage = get(config, 'client.loginPage')
    this.expiredPage = get(config, 'client.expiredPage')
  }

  createCookie(ctx, user) {
    const expires =
      user.status === 'trial'
        ? user.endOfTrialPeriod
        : moment()
            .add(this.maxAge, 'milliseconds')
            .toDate()
    const value = this.encodeCookieValue(user, expires)
    ctx.cookies.set(this.key, value, { maxAge: this.maxAge, expires, domain: this.domain, secure: false, overwrite: true })
  }

  deleteCookie(ctx) {
    ctx.cookies.set(this.key, null)
  }

  async isCookieValid(ctx) {
    const cookie = ctx.cookies.get(this.key)
    try {
      const user = JSON.parse(this.decodeCookieValue(cookie))
      if (user.status === 'expired') return this.expiredPage

      else if (new Date(user.expireDate) < new Date() && user.status === 'trial') {
        return this.expiredPage
      }

      else if (user.status === 'active' && user.email) {
        if (new Date(user.expireDate) > new Date()) return true
      }
      else {
        throw new Error()
      }
    } catch (e) {
      return this.loginPage  
    }
  }

  readCookie(ctx) {
    let cookie = ctx.cookies.get(this.key)
    try {
      const value = JSON.parse(this.decodeCookieValue(cookie))
      return value
    } catch (e) {
      return false
    }
  }

  encodeCookieValue(user, expireDate) {
    const { _id, fullname = '', email, status, personalDetails, role = 'client' } = user
    const userData = {
      _id,
      fullname,
      email,
      role,
      status,
      personalDetails,
      timestamp: new Date().getTime() / 1000,
      expireDate
    }

    rijnDeal256Ecb.open(this.secretKey)

    return rijnDeal256Ecb.encrypt(JSON.stringify(userData)).toString('base64')
  }

  decodeCookieValue(decodeThis) {
    rijnDeal256Ecb.open(this.secretKey)
    return rijnDeal256Ecb
      .decrypt(new Buffer.from(decodeThis, 'base64'))
      .toString()
      .replace(/\0/g, '')
  }
}

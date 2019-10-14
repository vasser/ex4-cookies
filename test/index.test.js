const sinon = require("sinon");
const { expect } = require("chai");
const { cloneDeep, get, set } = require("lodash");

let defaultConfig = {
  cookies: {
    key: "testcookiename",
    domain: "localhost",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secretKey: "i'm a secret key"
  },
  client: {
    loginPage: "/login",
    expiredPage: "/expired"
  }
};

const cookieKey = defaultConfig.cookies.key;

let defaultUser = {
  _id: "5da4c381346edeb66bf4c955",
  fullname: "Jey Simpson",
  email: "jsimpson@wtf.com",
  status: "active",
  personalDetails: { dummy: "data" },
  role: "client",
  showOnboarding: true
};

let defaultCookie =
  "u2zUXThv9fcLnMVnWMC8eT218hrQUsHOQKkUGkIdML1reSsX4NwmjmXZnyn08zP+bE2lgjRXx1Nj9O91kr9JwrdFrGf863vpJBj3n65tbD7b0Qzl1UaJa6cv1VCEuUCqq5/k04nW1gtVwi3rJaAl9X314WJH7MxjG/SQBTVX3mhS0tMycGZqsqtxvUmD0PAK0d0vOB7xM5nttAxFXwtgfIxLJmMvsfhcStXQzZLchj1girtxwVVWWHn5HbrZq4QG3W8DU6Shj4fQR+5IhaWK4LM5B1PmqKzIr1klFHNODvuOCNCoxqRMrKRrqH8k44QLVHf9Zw2lKfC8eNLvEMY3QA==";

let defaultCookieJson = {
  _id: "5da4c381346edeb66bf4c955",
  fullname: "Jey Simpson",
  email: "jsimpson@wtf.com",
  role: "client",
  status: "active",
  showOnboarding: true,
  personalDetails: { dummy: "data" },
  timestamp: 1571087430.854,
  expireDate: "2019-11-13T21:10:30.854Z"
};

let ctx = {
  cookies: {
    get: key => {
      return get(this, key);
    },
    set: (key, value) => {
      set(this, key, value);
      return true;
    }
  }
};

describe("Cookies package", () => {
  let clock, user;
  const CookiesLib = require("../index");
  const cookiesLib = new CookiesLib(defaultConfig);

  beforeEach(async () => {
    clock = sinon.useFakeTimers({ now: 1571087430854 });
    user = cloneDeep(defaultUser);
    ctx.cookies.set(cookieKey, null);
  });

  afterEach(() => {
    clock.restore();
  });

  describe("Cookies actions", () => {
    it("Creates cookie", async () => {
      cookiesLib.createCookie(ctx, user);
      expect(ctx.cookies.get(cookieKey)).to.be.eq(defaultCookie);
    });

    it("Creates cookie and sets default values", async () => {
      const testUser = cloneDeep(defaultUser);
      delete testUser["fullname"];
      delete testUser["role"];
      delete testUser["showOnboarding"];
      cookiesLib.createCookie(ctx, testUser);
      const cookie = cookiesLib.readCookie(ctx);
      expect(cookie["fullname"]).to.be.empty;
      expect(cookie["role"]).to.eq("client");
      expect(cookie["showOnboarding"]).to.be.false;
    });

    it("Deletes cookie", () => {
      ctx.cookies.set(cookieKey, defaultCookie);
      cookiesLib.deleteCookie(ctx);
      expect(ctx.cookies.get(cookieKey)).to.be.null;
    });

    it("Reads valid cookie", () => {
      ctx.cookies.set(cookieKey, defaultCookie);
      const cookie = cookiesLib.readCookie(ctx);
      expect(cookie).to.deep.eq(defaultCookieJson);
    });

    it("Returns false if reads invalid cookie", () => {
      ctx.cookies.set(cookieKey, "somebrokencookie==");
      const cookie = cookiesLib.readCookie(ctx);
      expect(cookie).to.be.false;
    });
  });

  describe("Is cookie valid", async () => {
    it("Broken cookie returns login page", async () => {
      ctx.cookies.set(cookieKey, "somebrokencookie==");
      const result = await cookiesLib.isCookieValid(ctx);
      expect(result).to.be.eq(defaultConfig.client.loginPage);
    });

    it("Expired cookie returns expired page", async () => {
      const testUser = cloneDeep(defaultUser);
      testUser["status"] = "expired";
      cookiesLib.createCookie(ctx, testUser);
      const result = await cookiesLib.isCookieValid(ctx);
      expect(result).to.be.eq(defaultConfig.client.expiredPage);
    });

    it("In-active user returns login page", async () => {
      const testUser = cloneDeep(defaultUser);
      testUser["status"] = "inactive";
      cookiesLib.createCookie(ctx, testUser);
      const result = await cookiesLib.isCookieValid(ctx);
      expect(result).to.be.eq(defaultConfig.client.loginPage);
    });

    it("Valid cookie returns true", async () => {
      cookiesLib.createCookie(ctx, user);
      const result = await cookiesLib.isCookieValid(ctx);
      expect(result).to.be.true;
    });
  });
});

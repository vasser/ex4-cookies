export interface Config {
    client: {
        expiredPage: string;
        loginPage: string;
    };
    cookies: {
        domain: string;
        key: string;
        maxAge: number;
        sameSite: boolean;
        secure: boolean;
        secretKey: string;
    };
    email: {
        apiKey: string;
        domain: string;
        fromEmail: string;
    };
}

export interface UserCookies {
    _id: object;
    email: string;
    endOfTrialPeriod: string;
    expireDate: string;
    fullname: string;
    personalDetails: object;
    role: string;
    showOnboarding: boolean;
    status: string;
}

export interface UserEmail {
    _id: object;
    settings: {
        emails: {
            send: boolean;
        };
    };
}

export interface MessageData {
    __domain__?: string;
    __email__?: string;
    __unsubscribe__?: string;
    [propName: string]: any;
}

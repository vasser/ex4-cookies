import { isString } from 'lodash';
import { MCrypt } from 'mcrypt';

const rijnDeal256Ecb = new MCrypt('rijndael-256', 'ecb');

const ENC = 'base64';

class Hash {
    hashData(data, key): string {
        rijnDeal256Ecb.open(key);
        let dataToHash = data;
        if (!isString(dataToHash)) dataToHash = JSON.stringify(dataToHash);
        return rijnDeal256Ecb.encrypt(dataToHash).toString(ENC);
    }

    deHashData(hash, key): string {
        rijnDeal256Ecb.open(key);
        return rijnDeal256Ecb
            .decrypt(Buffer.from(hash, ENC))
            .toString()
            .replace(/\0/g, '');
    }
}

export = Hash;

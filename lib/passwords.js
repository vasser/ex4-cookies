const fs = require("fs");

/**
 * Check if password appears in the list of 1 000 000 common paswords in Internet
 * https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt
 */
const isCommonPassword = async pwd => {
  let result = false;
  const readStream = fs.createReadStream(
    `${__dirname}/../sources/common-passwords-1000000.txt`,
    { encoding: "utf8" }
  );

  for await (const data of readStream) {
    data
      .toString()
      .split("\n")
      .forEach(p => {
        if (p === pwd) {
          result = true;
          readStream.close();
        }
      });
  }

  return result;
};

module.exports = { isCommonPassword };

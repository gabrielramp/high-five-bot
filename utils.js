const crypto = require('crypto');

function generaterandomString() {
    return crypto.randomBytes(5).toString('hex');
};

function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {generaterandomString};
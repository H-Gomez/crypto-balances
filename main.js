const request = require('request');
const crypto = require('crypto');
const sign = require('./lib/signMessage');
const config = require('./lib/configuration');
const body = {};
const rawBody = JSON.stringify(body);

function signMessage(url, nonce, hmac, apiSecret) {
    let signature = `/api/${url}${nonce}${rawBody}`;
    signature = crypto
        .createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

// Constructor
function Bitfinex() {
    this.apiKey = config.get('bitfinex:key');
    this.apiSecret = config.get('bitfinex:secret');
    this.baseUrl = config.get('bitfinex:url');
    this.hmac = config.get('bitfinex:hmac');
}

/**
 * Get the value of each available wallet and use as a parameter for the passed
 * in callback function.
 * @param {function} callback
 * @return {object} wallets
 */
Bitfinex.prototype.getWallets = function(callback) {
    let url = 'v2/auth/r/wallets';
    let nonce = Date.now().toString();
    let signature = signMessage(url, nonce, this.hmac, this.apiSecret);
    let options = {
        url: `${this.baseUrl}${url}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': this.apiKey,
            'bfx-signature': signature
        },
        json: body
    };

    request.post(options, function (error, response, body) {
        let balances = { BTC: 0, ETH: 0, ETC: 0, XMR: 0, USD: 0 };

        body.forEach(function(item) {
            if (item[1] === 'BTC') {
                balances.BTC += item[2];
            }
            if (item[1] === 'ETH') {
                balances.ETH += item[2];
            }
            if (item[1] === 'ETC') {
                balances.ETC += item[2];
            }
            if (item[1] === 'XMR') {
                balances.XMR += item[2];
            }
            if (item[1] === 'USD') {
                balances.USD += item[2];
            }
        });

        callback(balances);
    });
};

/**
 * Get the value of all positions on in USD and use as the parameter for the passed
 * in callback function.
 * @param {function} callback
 * @return {string} positionValue
 */
Bitfinex.prototype.getPositions = function(callback) {
    let url = 'v2/auth/r/margin/base';
    let nonce = Date.now().toString();
    let signature = signMessage(url, nonce, this.hmac, this.apiSecret);
    let options = {
        url: `${this.baseUrl}${url}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': this.apiKey,
            'bfx-signature': signature
        },
        json: body
    };

    request.post(options, function (error, response, body) {
        callback('$' + body[1][0]);
    });
};

module.exports = new Bitfinex();

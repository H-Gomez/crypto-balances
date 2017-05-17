const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');
const sign = require('../lib/signMessage');

const body = {};
const rawBody = JSON.stringify(body);

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
    let signature = `/api/${url}${nonce}${rawBody}`;
    let signedMessage = sign.signMessage(signature, this.hmac, this.apiSecret);
    let options = {
        url: `${this.baseUrl}${url}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': this.apiKey,
            'bfx-signature': signedMessage
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
    let signature = `/api/${url}${nonce}${rawBody}`;
    let signedMessage = sign.signMessage(signature, this.hmac, this.apiSecret);
    let options = {
        url: `${this.baseUrl}${url}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': this.apiKey,
            'bfx-signature': signedMessage
        },
        json: body
    };

    request.post(options, function (error, response, body) {
        callback('$' + body[1][0]);
    });
};

module.exports = new Bitfinex();

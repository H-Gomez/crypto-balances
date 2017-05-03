const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');

const baseUrl = config.get('poloniex:url');

let nonce = Date.now().toString();
let tradingUrl = 'command=returnCompleteBalances&nonce=';
let parameters = {
    command: 'returnCompleteBalances',
    nonce: nonce
};

// Constructor
function Poloniex() {
    this.apiKey = config.get('poloniex:key');
    this.apiSecret = config.get('poloniex:secret');
    this.baseUrl = config.get('poloniex:url');
    this.hmac = config.get('poloniex:hmac');
}

Poloniex.prototype.getBalances = function(callback) {
    let options = {
        method: 'POST',
        url: baseUrl,
        form: parameters,
        json: true,
        headers: {
            Key: this.apiKey,
            Sign: signMessage(tradingUrl, nonce, 'sha512', this.apiSecret),
        }
    };

    request(options, function(err, response, body) {
        let value = 0;
        for (let coin in body) {
            if (body[coin]['btcValue'] > 0) {
                value += parseFloat(body[coin]['btcValue']);
            }
        }

        callback(value.toFixed(8));
    });
};

function signMessage(url, nonce, hmac, apiSecret) {
    let signature = `${url}${nonce}`;
    signature = crypto.createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

module.exports = new Poloniex();

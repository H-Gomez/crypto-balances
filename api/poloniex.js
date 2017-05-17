const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');

let baseUrl = config.get('poloniex:url');
let tradingUrl = 'command=returnCompleteBalances&nonce=';

// Constructor
function Poloniex() {
    this.apiKey = config.get('poloniex:key');
    this.apiSecret = config.get('poloniex:secret');
    this.baseUrl = config.get('poloniex:url');
    this.hmac = config.get('poloniex:hmac');
}

Poloniex.prototype.getBalances = function(callback) {
    let nonce = Date.now().toString();
    let options = {
        method: 'POST',
        url: baseUrl,
        json: true,
        form: {
            command: 'returnCompleteBalances',
            nonce: nonce
        },
        headers: {
            Key: this.apiKey,
            Sign: signMessage(tradingUrl, nonce, 'sha512', this.apiSecret),
        }
    };

    request(options, function(err, response, body) {
        let btcAmount = 0;
        for (let coin in body) {
            if (body[coin]['btcValue'] > 0) {
                btcAmount += parseFloat(body[coin]['btcValue']);
            }
        }

        callback(btcAmount.toFixed(8));
    });
};

function signMessage(url, nonce, hmac, apiSecret) {
    let signature = `${url}${nonce}`;
    signature = crypto
        .createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

module.exports = new Poloniex();

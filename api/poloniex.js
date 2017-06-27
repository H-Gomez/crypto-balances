const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');
const sign = require('../lib/signMessage');

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
    let accountType = '&account=all';
    let signature = `${tradingUrl}${nonce}${accountType}`;
    let options = {
        method: 'POST',
        url: baseUrl,
        json: true,
        form: {
            command: 'returnCompleteBalances',
            nonce: nonce,
            account: 'all'
        },
        headers: {
            Key: this.apiKey,
            Sign: sign.signMessage(signature, 'sha512', this.apiSecret),
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log("There was an error with Poloniex API: " + error);
            return;
        }

        let btcAmount = 0;
        for (let coin in body) {
            if (body[coin]['btcValue'] > 0) {
                btcAmount += parseFloat(body[coin]['btcValue']);
            }
        }

        callback(btcAmount.toFixed(8));
    });
};

module.exports = new Poloniex();

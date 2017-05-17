const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');
let nonce = Date.now().toString();

// Constructor
function Bittrex() {
    this.apiKey = config.get('bittrex:key');
    this.apiSecret = config.get('bittrex:secret');
    this.baseUrl = config.get('bittrex:url');
    this.hmac = config.get('bittrex:hmac');
}

/**
 * Get the value of each available wallet and use as a parameter for the passed
 * in callback function.
 * @param {function} callback
 * @return {object} wallets
 */
Bittrex.prototype.getWallets = function(callback) {
    let uri = `${this.baseUrl}account/getbalances?apikey=${this.apiKey}&nonce=${nonce}`;
    let options = {
        method: 'GET',
        url: uri,
        json: true,
        headers: {
            Key: this.apiKey,
            apisign: signMessage(uri, 'sha512', this.apiSecret),
        }
    };

    request(options, function(err, response, body) {
        let btcAmount = 0;
        for (let coin in body) {
            if (body[coin]['btcValue'] > 0) {
                btcAmount += parseFloat(body[coin]['btcValue']);
            }
        }

        console.log(response);
    });

};

function signMessage(url, hmac, apiSecret) {
    let signature = `${url}`;
    signature = crypto
        .createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

module.exports = new Bittrex();

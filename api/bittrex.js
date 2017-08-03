const request = require('request');
const crypto = require('crypto');
const config = require('../lib/configuration');
const sign = require('../lib/signMessage');
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
            apisign: sign.signMessage(uri, 'sha512', this.apiSecret),
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log("There was an error with Bittrex API:" + error);
            return;
        }

        // Build result object for available balances.
        let availableBalances = [];
        body.result.forEach(function(coin) {
            if (coin['Balance'] > 0) {
                availableBalances.push(coin);
            }
        });

        callback(availableBalances);
    });
};

/**
 * Public call to get ticker prices from API.
 * @param ticker
 * @param callback
 */
Bittrex.prototype.getTicker = function(ticker, callback) {
    let uri = `${this.baseUrl}/public/getticker?market=BTC-${ticker}`;
    let options = {
        method: 'GET',
        url: uri,
        json: true
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log("There was an error getting the tickers for Bittrex: " + error);
            return;
        }

        if (body.result ===  null) {
            console.log("Response body was null");
            return;
        }

        if ( body.result === undefined) {
            console.log("Body result was undefined");
            return;
        }

        if(body.result['Last']) {
            callback(body.result['Last']);
        }
    });
};

module.exports = new Bittrex();

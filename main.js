const request = require('request');
const crypto = require('crypto');
const config = require('./lib/configuration');

const symbols = ['BTC', 'ETH', 'ETC', 'XMR', 'USD'];

const apiKey = config.get('bitfinex:key');
const apiSecret = config.get('bitfinex:secret');
const url = 'v2/auth/r/wallets';

let nonce = Date.now().toString();
const body = {};
const rawBody = JSON.stringify(body);

function signMessage() {
    let signature = `/api/${url}${nonce}${rawBody}`;
    signature = crypto.createHmac('sha384', apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

function getBitfinexWallets() {
    let signature = signMessage();
    let options = {
        url: `https://api.bitfinex.com/${url}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': apiKey,
            'bfx-signature': signature
        },
        json: body
    };

    request.post(options, function (error, response, body) {
        let balances = {
            BTC: 0, ETH: 0, ETC: 0, XMR: 0, USD: 0
        };

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

        console.log(balances);
    });
}

getBitfinexWallets();

const request = require('request');
const crypto = require('crypto');
const config = require('./lib/configuration');

const apiKey = config.get('poloniex:key');
const apiSecret = config.get('poloniex:secret');
const url = config.get('poloniex:url');
let nonce = Date.now().toString();

let signature = `${url}${nonce}`;

signature = crypto.createHmac('sha512', apiSecret)
    .update(signature)
    .digest('hex');

return {
    Key: apiKey,
    Sign: signature
};

let parameters = {};
request.post('returnBalances', parameters, function(error, response, body) {
    console.log(body);
});

function createHeader(api_key, secret_key, user_agent, data ) {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': user_agent,
        'Key': api_key,
        'Sign': verify.sign('sha512', secret_key, data),
    };
}

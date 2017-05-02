const crypto = require('crypto');

function signMessage(url, nonce, hmac, apiSecret) {
    let signature = `/api/${url}${nonce}${rawBody}`;
    signature = crypto
        .createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return signature;
}

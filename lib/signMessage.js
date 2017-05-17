const crypto = require('crypto');

/**
 * Returns a signed messaged based on the passed signature string and hmac algo.
 * @param signature
 * @param hmac
 * @param apiSecret
 * @return {*}
 */
function signMessage(signature, hmac, apiSecret) {
    let _signature = signature;
    _signature = crypto
        .createHmac(hmac, apiSecret)
        .update(signature)
        .digest('hex');

    return _signature;
}

module.exports = {
    signMessage: signMessage
};

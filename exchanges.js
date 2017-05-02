// Pull from exchanges
const Bitfinex = require('./main.js');

Bitfinex.getWallets(function(response) {
    console.log(response)
});
Bitfinex.getPositions(function(response) {
    console.log(response);
});
// calc balances
// Authenticate with Google API
// Push updates to sheets
// set interval

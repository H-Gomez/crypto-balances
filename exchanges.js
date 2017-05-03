const Bitfinex = require('./api/bitfinex.js');
const Poloniex = require('./api/poloniex.js');
const Google = require('./api/google.js');
const fs = require('fs');

// Bitfinex.getWallets(function(response) {
//     fs.readFile('./config/cellMap.json', function(error, fileContents) {
//         if (error) {
//             console.log("There was an error reading the file contents " + error);
//         } else {
//             let cells = JSON.parse(fileContents);
//             let exchangePayload = {
//                 "Wallets": response,
//                 "Cells": cells['Bitfinex']
//             };
//
//             Google.post(exchangePayload);
//         }
//     });
//
// });

Poloniex.getBalances(function(response) {
    console.log(response);
});

// Bitfinex.getPositions(function(response) {
//     console.log(response);
// });

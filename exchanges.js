const Bitfinex = require('./api/bitfinex.js');
const Poloniex = require('./api/poloniex.js');
const Google = require('./api/google.js');
const fs = require('fs');

fs.readFile('./config/cellMap.json', function(error, fileContents) {
   if (error) {
        console.log("Unable to read cell map " + error);
   } else {
        let cellMap = JSON.parse(fileContents);

        Bitfinex.getWallets(function(response) {
           let exchangePayload = {
               "Wallets": response,
               "Cells": cellMap['Bitfinex']
           };

           Google.post(exchangePayload);
       });

       Poloniex.getBalances(function(response) {
           let exchangePayload = {
               "Wallets": { BTC: response },
               "Cells": cellMap['Poloniex']
           };

           Google.post(exchangePayload);
       });
   }
});






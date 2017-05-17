// Local required modules
const Bitfinex = require('./api/bitfinex.js');
const Poloniex = require('./api/poloniex.js');
const Bittrex = require('./api/bittrex.js');
const Google = require('./api/google.js');

// Third party modules
const fs = require('fs');
const cron  = require('cron');

let runSheetUpdater = cron.job('0 * * * * *', function() {
    fs.readFile('./config/cellMap.json', function(error, fileContents) {
        if (error) {
            console.log("Unable to read cell map " + error);
        } else {
            let cellMap = JSON.parse(fileContents);

            // Bittrex.getWallets(function(response) {
            //     console.log(response);
            // });

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

    console.log('Cron job finished');
});

runSheetUpdater.start();








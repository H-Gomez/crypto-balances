// Local required modules
const Bitfinex = require('./api/bitfinex.js');
const Poloniex = require('./api/poloniex.js');
const Bittrex = require('./api/bittrex.js');
const Google = require('./api/google.js');

// Third party modules
const fs = require('fs');
const cron  = require('cron');

let runSheetUpdater = cron.job('1 * * * * *', function() {
    fs.readFile('./config/cellMap.json', function(error, fileContents) {
        if (error) {
            console.log("Unable to read cell map " + error);
        } else {
            let cellMap = JSON.parse(fileContents);

            Bittrex.getWallets(function(tickers) {
                // Calculate BTC value for each balance
                let btcValue = 0;
                let itemsProcessed = 0;
                let balances = { BTC: 0, USD: 0 };

                tickers.forEach(function(item) {
                    // If current ticker is Bitcoin
                    if (item['Currency'] === 'BTC') {
                        btcValue += item['Balance'];
                        return;
                    } else if (item['Currency'] === 'USDT') {
                        balances.USD = item['Balance'];
                        return;
                    }

                    if (item['Currency'] !== 'USDT' || item['Currency'] !== 'BTC') {
                        Bittrex.getTicker(item['Currency'], function(response) {
                            btcValue += item['Balance'] * response;
                            itemsProcessed++;
                            if (itemsProcessed === (tickers.length - 2)) {
                                Google.postToSingle(btcValue);
                            }
                        });
                    }
                });
            });

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











const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const config = require('../lib/configuration');

// Google sheets required variables.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
const spreadsheetId = config.get('google:spreadsheetID');



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, dataset) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, dataset);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback to call with the authorized
 * client.
 */
function getNewToken(oauth2Client, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Begins the authentication process to batch update spreadsheets.
 * @param data
 * @constructor
 */
function PostToSheet(data) {
    // Load client secrets from a local file.
    fs.readFile('./config/client_secret.json', function processClientSecrets(error, content) {
        if (error) {
            console.log('Error loading client secret file: ' + error);
            return;
        }
        // Authorize a client with the loaded credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), updateSheets, data);
    });
}

function PostToSheetSingle(data) {
    // Load client secrets from a local file.
    fs.readFile('./config/client_secret.json', function processClientSecrets(error, content) {
        if (error) {
            console.log('Error loading client secret file: ' + error);
            return;
        }
        // Authorize a client with the loaded credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), updateSheetSingle, data);
    });
}

/**
 * Update the spreadsheet with the given payload. Requires the spreadsheet ID to be passed in.
 * @param {object} auth
 * @param {object} payload
 */
function updateSheets(auth, payload) {
    let sheets = google.sheets('v4');
    let dataset = [];

    // Build payload object
    for (let index in payload['Wallets']) {
        let dataToPush = {};
        dataToPush.range = payload['Cells'][index];
        dataToPush.majorDimension = 'ROWS';
        dataToPush.values = [[payload['Wallets'][index]]];
        dataset.push(dataToPush);
    }

    let request = {
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: dataset,
        },
        auth: auth
    };

    sheets.spreadsheets.values.batchUpdate(request, function(error, response) {
        if (error) {
            console.log("There was an error updating the sheet " + error);
        } else {
            console.log("Updated spreadsheet successfully");
        }
    });
}

function updateSheetSingle(auth, payload) {
    let sheets = google.sheets('v4');
    let request = {
        spreadsheetId: spreadsheetId,
        range: 'BTC Trades!E10',
        valueInputOption: 'USER_ENTERED',
        resource: {
            range: 'BTC Trades!E10',
            majorDimension: 'ROWS',
            values: [[payload]]
        },
        auth: auth
    };

    sheets.spreadsheets.values.update(request, function(error, response) {
       if (error) {
           console.log("There was an error doing an single update: " + error);
       } else {
           console.log("Updated spreadsheet with single payload");
       }
    });
}

module.exports = {
    post: PostToSheet,
    postToSingle: PostToSheetSingle
};

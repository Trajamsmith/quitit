var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const fetchEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    // Load client secrets from a local file.
    const credentials = yield fs.promises.readFile('credentials.json', 'utf-8');
    const { client_secret, client_id, redirect_uris } = JSON.parse(credentials).installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    try {
        const auth = yield authorize(oAuth2Client);
        listEvents(auth);
    }
    catch (_a) {
        const auth = yield getAccessToken(oAuth2Client);
        listEvents(auth);
    }
});
fetchEvents();
/**
 * Create an OAuth2 client with the given credentials.
 * @param {Object} credentials The authorization client credentials.
 */
const authorize = (oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if we have previously stored a token.
    const token = yield fs.promises.readFile(TOKEN_PATH, 'utf8');
    return oAuth2Client.setCredentials(JSON.parse(token));
});
/**
 * Get and store new token after prompting for user authorization.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
const getAccessToken = (oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, newToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return console.error('Error retrieving access token', err);
            token = newToken;
            // Store the token to disk for later program executions
            try {
                yield fs.promises.writeFile(TOKEN_PATH, JSON.stringify(newToken));
                console.log('Token stored to', TOKEN_PATH);
            }
            catch (err) {
                console.log(err);
            }
        }));
    });
    return oAuth2Client.setCredentials(token);
});
/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const listEvents = (auth) => {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        }
        else {
            console.log('No upcoming events found.');
        }
    });
};
//# sourceMappingURL=fetchEvents.js.map
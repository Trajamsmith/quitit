/**
 * This script is a hideous adaptation of Google's example Node
 * implementation of the Calendar API. It needs to be revisited.
 */

import fs from 'fs'
import readline from 'readline'
import { google, calendar_v3 } from 'googleapis'

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

const fetchEvents = async () => {
    // Load client secrets from a local file.
    const credentials = await fs.promises.readFile('credentials.json', 'utf-8')
    const { client_secret, client_id, redirect_uris } = JSON.parse(
        credentials
    ).installed

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    )

    try {
        // Check if we have previously stored a token.
        const token = await fs.promises.readFile(TOKEN_PATH, 'utf8')
        oAuth2Client.setCredentials(JSON.parse(token))
        return listEvents(oAuth2Client)
    } catch {
        // If no token is stored locally, we have to fetch one
        getAccessToken(oAuth2Client)
    }
}

const getAccessToken = async (oAuth2Client) => {
    let token: string
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', async (code) => {
        rl.close()
        try {
            const { tokens } = await oAuth2Client.getToken(code)
            token = tokens
            await fs.promises.writeFile(TOKEN_PATH, JSON.stringify(tokens))
            console.log('Token stored to', TOKEN_PATH)
        } catch (err) {
            console.error('Error retrieving access token', err)
        }
    })
}

const listEvents = async (auth) => {
    const calendar = google.calendar({ version: 'v3', auth })
    const listOptions = {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }

    try {
        const { data } = await calendar.events.list(listOptions)
        return data
    } catch (err) {
        console.log('There was an API error: ', err)
    }
}

export default fetchEvents

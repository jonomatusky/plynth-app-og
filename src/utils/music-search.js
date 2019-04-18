const request = require('request-promise-native')

const spotifyCredentials = String(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
const base64Credentials = Buffer.from(spotifyCredentials).toString('base64')

const spotifyTokenUrl = 'https://accounts.spotify.com/api/token'
const spotifyApiUrl = 'https://api.spotify.com/v1/'

const musicSearch = async (search) => {

    const tokenData = await request ({
        method: 'POST',
        uri: spotifyTokenUrl,
        headers: {
            'Authorization': 'Basic ' + base64Credentials  
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    })
    
    const musicSearch = await request ({
        method: 'GET',
        uri: spotifyApiUrl + 'search?q=' + search + '&type=album&limit=5',
        json: true,
        auth: {
            'bearer': tokenData.access_token
        }
    })

    return musicSearch
}

module.exports = musicSearch
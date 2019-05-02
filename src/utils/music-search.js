const request = require('request-promise-native')
const { removeOneWord } = require('../utils/search-cleanup')

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

    if (!tokenData) {
        throw new Error('Unable to authenticate with music search engine')
    }

    let searchArray = search.split(" ")

    while (searchArray.length > 0) {
        searchString = searchArray.join(" ")
        console.log('Searching: '+ searchString)
        try {
            const musicSearch = await request ({
                method: 'GET',
                uri: spotifyApiUrl + 'search?q=' + searchString + '&type=album&limit=5',
                json: true,
                auth: {
                    'bearer': tokenData.access_token
                }
            })

            console.log(musicSearch)

            if (musicSearch && musicSearch.albums.items.length > 0) {
                return musicSearch
            }

            if (searchArray.length === 1) {
            }

            searchArray.pop()            
        } catch (e) {
            console.log(e)
        }
    }
    throw new Error('Unable to find album')
    
}

module.exports = musicSearch
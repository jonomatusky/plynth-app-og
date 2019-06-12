const automl = require('@google-cloud/automl').v1beta1
const request = require('request-promise-native')
const {auth} = require('google-auth-library');

// load the environment variable with our keys
const keysEnvVar = process.env['CREDS']
if (!keysEnvVar) {
  return
}

// Create client for prediction service.
const client = new automl.PredictionServiceClient({ credentials: JSON.parse(keysEnvVar) })

const projectId = `player-228301`
const computeRegion = `us-central1`
const modelId = `ICN5918389947800532940`
// const filePath = `local text file path of content to be classified, e.g. "./resources/test.txt"`

const spotifyCredentials = String(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
const base64Credentials = Buffer.from(spotifyCredentials).toString('base64')

const spotifyTokenUrl = 'https://accounts.spotify.com/api/token'
const spotifyApiUrl = 'https://api.spotify.com/v1/albums/'

// Get the full path of the model.
const modelFullId = client.modelPath(projectId, computeRegion, modelId);

const automlSearch = async (imageBuffer) => {
  try {
    const payload = {}
    const params = {}
  
    payload.image = {imageBytes: imageBuffer}
    params.score_threshold = 0.95
  
    console.log('sending')
  
    const [response] = await client.predict({
      name: modelFullId,
      payload: payload,
      params: params,
    });
  
    console.log(response)
  
    console.log(`Prediction results:`);
    response.payload.forEach(result => {
      console.log(`Predicted class name: ${result.displayName}`);
      console.log(`Predicted class score: ${result.classification.score}`);
    });
  
    const albumID = response.payload[0].displayName
  
    console.log('Album ID is: ' + albumID)
  
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
      uri: spotifyApiUrl + albumID,
      json: true,
      auth: {
          'bearer': tokenData.access_token
      }
    })
  
    console.log(musicSearch)
  
    return musicSearch
  } catch (e) {
    return
  }
}

module.exports = automlSearch
const path = require('path')
const vision = require('@google-cloud/vision')

const {auth} = require('google-auth-library');

// load the environment variable with our keys
const keysEnvVar = process.env['CREDS']
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!')
}

const client = new vision.ImageAnnotatorClient({ credentials: JSON.parse(keysEnvVar)})

const visionSearch = async (imageBuffer) => {
    const searchResults = await client.annotateImage({
        image: { content: imageBuffer },
        features: [{
            type: 'WEB_DETECTION',
            maxResults: 5
        }]
    })

    return searchResults[0].webDetection
}

module.exports = visionSearch
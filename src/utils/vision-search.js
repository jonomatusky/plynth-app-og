const path = require('path')
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient({keyFilename: '../music-box/config/google-cred.json'});

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
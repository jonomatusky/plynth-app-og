const mongoose = require('mongoose')
const request = require('request-promise-native')
const path = require('path')

const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient({keyFilename: '../crate/config/google-cred.json'});

const visionSearch = require('../utils/vision-search')
const musicSearch = require('../utils/music-search')
const searchCleanup = require('../utils/search-cleanup')

const scanSchema = new mongoose.Schema({
    visionSearch: {
        type: Object
    },
    musicSearch: {
        type: Object
    },
    spotfiyToken: {
        type: String
    },
    correct: {
        type: Boolean,
    },
    photo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Photo'
    }, 
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }
}, {
    timestamps: true
})

scanSchema.methods.performVisionSearch = async function () {
    const imageBuffer = Buffer.from(this.photo.image).toString('base64')

    this.visionSearch = await visionSearch(imageBuffer)
    return this
}

scanSchema.methods.performMusicSearch = async function () {
    const visionResult = this.visionSearch.bestGuessLabels[0].label

    if (!visionResult) {
        throw new Error ('Unable to identify image')
    }

    const search = await searchCleanup(visionResult)
    const musicSearchData = await musicSearch(search)

    this.musicSearch = musicSearchData.albums.items

    return this
}

const Scan = mongoose.model('Scan', scanSchema)

module.exports = Scan
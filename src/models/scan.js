const mongoose = require('mongoose')

const visionSearch = require('../utils/vision-search')
const musicSearch = require('../utils/music-search')
const { searchCleanup } = require('../utils/search-cleanup')
const automlSearch= require('../utils/automl-search')

const scanSchema = new mongoose.Schema({
    source: {
        type: String
    },
    visionSearch: {
        type: Object
    },
    search: {
        type: String
    },
    musicSearch: {
        type: Object
    },
    spotifyToken: {
        type: String
    },
    automlSearch: {
        type: Object
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

    const visionResult = this.visionSearch.bestGuessLabels[0].label
    const search = await searchCleanup(visionResult)
    this.search = search

    const musicSearchData = await musicSearch(search)
    this.musicSearch = musicSearchData.albums.items

    return this
}

scanSchema.methods.performAutomlSearch = async function () {
    const imageBuffer = Buffer.from(this.photo.image).toString('base64')

    const album = await automlSearch(imageBuffer)

    this.automlSearch = album
    return this
}

const Scan = mongoose.model('Scan', scanSchema)

module.exports = Scan
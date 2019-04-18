const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
    image: {
        type: Buffer
    }, 
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }
}, {
        timestamps: true
})

const Photo = mongoose.model('Photo', photoSchema)

module.exports = Photo

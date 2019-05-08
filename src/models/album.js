const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema({
    name: {
        type: String
    },
    artists: {
        type: String
    },
    image: {
        type: Buffer
    },
    album_type: {
        type: String
    },
    imageURL: {
        type: String
    },
    type: {
        type: String
    },
    spotifyId: {
        type: String,
        required: true
    },
    spotifyURI: {
        type: String
    }
}, {
    timestamps: true
})

albumSchema.virtual('scans', {
    ref: 'Scan',
    localField: '_id',
    foreignField: 'album'
})

albumSchema.virtual('photos', {
    ref: 'Photo',
    localField: '_id',
    foreignField: 'album'
})

//Input a scan, determine whether the album already exists and, if not, adds it. Saves scan, album and photo.
albumSchema.statics.newFromScan = async function (scan) {

    if (scan.automlSearch) {
        firstResult = scan.automlSearch
    } else if (scan.musicSearch[0]){
        firstResult = scan.musicSearch[0]
    } else {
        throw new Error('No guess found')
    }

    const photo = scan.photo

    var album = await Album.findOne({ spotifyId: firstResult.id })

    if (!album) {
        album = new Album({ 
            name: firstResult.name,
            artists: firstResult.artists[0].name,
            album_type: firstResult.album_type,
            imageURL: firstResult.images[0].url,
            type: firstResult.type,
            spotifyId: firstResult.id,
            spotifyURI: firstResult.uri
        })
    }  
          
    try {
        scan.album = album._id
        photo.album = album._id
        await scan.save()
        await album.save()
        await photo.save()
        return album
    } catch (e) {
        throw new Error('Unable to save album')
    }
}

const Album = mongoose.model('Album', albumSchema)

module.exports = Album
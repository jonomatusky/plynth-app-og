const express = require('express')
const sharp = require('sharp')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

const Scan = require('./models/scan')
const Photo = require('./models/photo')
const Album = require('./models/album')

const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error('Please upload a jpeg or pgn image'))
        }
        cb(undefined, true)
    }
})

app.post('/scans', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        res.status(400).send({ Error: 'Please upload a file'})
        return
    }
    
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    const photo = new Photo({
        image: buffer
    })
    await photo.save()

    const scan = new Scan({ photo })

    await scan.performVisionSearch()
    await scan.performMusicSearch()
    await scan.save()

    const album = await Album.newFromScan(scan)

    res.status(201).send(album)

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message } )
})

app.get('/albums/:id/scans', async (req, res) => {
    const _id = req.params.id

    try {
        const album = await Album.findOne({ _id })

        if(!album) {
            return res.status(404).send()
        }

        await album.populate('scans').execPopulate()
        const scanList = []
        album.scans.forEach((scan) => {
            scanList.push({ id: scan._id, createdAt: scan.createdAt })
        })
        res.status(200).send(scanList)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.get('/albums/:id/photos', async (req, res) => {
    const _id = req.params.id

    try {
        const album = await Album.findOne({ _id })

        if(!album) {
            return res.status(404).send()
        }

        await album.populate('photos').execPopulate()
        const photoList = []
        album.photos.forEach((photo) => {
            photoList.push({ id: photo._id, createdAt: photo.createdAt })
        })
        res.status(200).send(photoList)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.use(express.json())

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
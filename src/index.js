const path = require('path')
const express = require('express')
const hbs = require('hbs')
const sharp = require('sharp')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

const Scan = require('./models/scan')
const Photo = require('./models/photo')
const Album = require('./models/album')

app.use(express.json())
app.use(express.bodyParser({limit: '50mb'}))

const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 100000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error('Unable to scan. Please upload a jpeg or pgn image.'))
        }
        cb(undefined, true)
    }
})

app.post('/scans', upload.single('file'), async (req, res) => {
    const source = req.hostname
    
    if (!req.file) { res.status(400).send({ error: 'Please upload a file' }) }

    const buffer = await sharp(req.file.buffer).png().resize({ width: 1600, height:1600 }).toBuffer()
    console.log(buffer.byteLength)
    const photo = new Photo({
        image: buffer,
        source
    })
    
    try {
        await photo.save()
    } catch (e) {
        console.log(error)
        res.status(500).send({ error: 'Unable to connect to database.'})
    }
    
    try {
        const scan = new Scan({ 
            photo,
            source
        })
        await scan.performVisionSearch()
        console.log(scan.visionSearch.bestGuessLabels[0].label)
        await scan.performMusicSearch()
        await scan.save()
        const album = await Album.newFromScan(scan)
        console.log(album.name)
        res.status(201).send({ album, scanId: scan._id })
    } catch (e) {
        console.log(e)
        res.status(404).send({ message: `Sorry, couldn't find that one! Try another.` })
    }
}, (error, req, res, next) => {
    res.status(400).send( { message: error.message } )
    console.log(error.message)
})

app.patch('/scans/:id', async (req, res) => {
    console.log('received')
    console.log(req.body)
    const updates = Object.keys(req.body)
    const allowedUpdates = ['correct']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ message: 'Invalid Updates'})
    }

    try {
        const scan = await Scan.findById(req.params.id)
        updates.forEach((update) => scan[update] = req.body[update])
        await scan.save()

        res.send(scan)
    } catch (e) {
        res.status(400).send(e)
    }
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

app.get('/scans/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['correct']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try {
        const scan = await Scan.findOne({ _id: req.params.id })

        if (!scan) {
            return res.status(404).send()
        }

        updates.forEach((update) => scan[update] = req.body[update])
        await scan.save()

        res.status(200).send({ correct: scan.correct })
    } catch (e) {
        res.status(500).send(e)
    }
})

app.use(express.json())

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000
const NASA_API = 'https://api.nasa.gov'

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`${NASA_API}/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover-mission', async (req, res) => {
  const rover=req.query.rover;
  try {
      const data = await fetch(`${NASA_API}/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
          .then(res => res.json())
      res.send(data.photo_manifest)
  } catch (err) {
      console.log('error:', err);
  }
})

app.get('/rover-photos', async (req, res) => {
  const rover=req.query.rover;
  const earth_date = req.query.earth_date;
  try {
      const data = await fetch(`${NASA_API}/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${earth_date}&api_key=${process.env.API_KEY}`)
          .then(res => res.json())
      res.send(data.photos)
  } catch (err) {
      console.log('error:', err);
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
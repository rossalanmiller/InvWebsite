

const express = require('express')
const bodyPareser = require('body-parser')
const db = require('./queries')
const app = express()
const port = 80

// Express Middleware
const helmet = require('helmet') // creates headers that protect from attacks (security)
const cors = require('cors')  // allows/disallows cross-site communication
const morgan = require('morgan') // logs requests
const auth = require('basic-auth')






// App Middleware
const whitelist = ['http://localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('combined')) // use 'tiny' or 'combined'
app.use(bodyPareser.json())
app.use(bodyPareser.urlencoded({
            extended: true})
)

//Basic test request to make sure the server is working
app.get('/api', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres Api'})
})

//Basic sandbox request for dev testing
app.get('/sb', db.validateUser, (req, res) =>{
  let user = auth.parse(req.header('authorization'))
  user.name = user.name + " Miller"
  res.json('Success')
})

// requests for the api

// requests for the gui

/*
app.get('/', (req, res) => res.send('hello world'))
app.get('/api/partReport', db.getReports)
app.post('/api/partReport', db.postReport)

app.put('/api/partReport', db.putReport)
app.delete('/api/partReport', db.deleteReport)
*/

// requests for testing/utilities
app.get('/api/testDB', db.testConnection)
app.get('/api/testServer', (req, res) => {
  console.log(req.headers)
  res.json({info: 'Connection established'})
})
// requests made from the app
app.post('/api/partReportApp', db.validateUser, db.postReportsApp)

// request made from the interface
app.get('/api/partReportInterface', db.validateUser, db.getReports)
process.on('uncaughtException', (exception) => {
    console.log(exception)
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
const express = require('express')
const bodyPareser = require('body-parser')
const db = require('./queries')
const app = express()
const port = 3000

app.use(bodyPareser.json())
app.use(bodyPareser.urlencoded({
            extended: true})
)

app.get('/api', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres Api'})
})

app.get('/api/partReport', db.getReports)
app.get('/api/partReport/:id', db.getReportByOrderId)
app.post('/api/partReport', db.createReport)

process.on('uncaughtException', (exception) => {
    console.log(exception)
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
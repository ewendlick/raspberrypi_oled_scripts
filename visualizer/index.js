const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const dayjs = require('dayjs')

const port = process.argv.slice(2)[0] || 9090
const db = new sqlite3.Database(path.join(__dirname, '../heat_tech.db'), (err) => {
  if (err) {
    console.error('err.message')
  } else {
    console.log('connected to the heat_tech database')
  }
}) // TODO: allow user to specify
// TODO: Split this up even further, so that this functions as an API server that serves the database information
// to a frontend, which polls every minute and redraws the content.

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/data', function (req, res) {
  const createdAtLimit = dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  db.all(`SELECT temperature, created_at FROM temperature_and_humidity WHERE created_at > '${createdAtLimit}'`, [], function(err, rows) {
    if (err) {
      throw err
    } else {
      res.json(rows)
    }
  })
})

app.get('/echarts.js', function (req, res) {
  // TODO: probably should switch to the npm version and build with Webpack
  res.sendFile(path.join(__dirname + '/assets/echarts-4-1-0/echarts.common.min.js'))
})

// TODO: print out the operating IP?
app.listen(port)

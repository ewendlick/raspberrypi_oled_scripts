const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const dayjs = require('dayjs')
const commandLineArgs = require('command-line-args')

const commandLineOptions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 9090 },
  { name: 'databasefile', alias: 'd', type: String, defaultValue: '../heat_tech.db' },
  { name: 'pollingseconds', alias: 'P', type: Number, defaultValue: 60 }
]
const options = commandLineArgs(commandLineOptions)

const db = new sqlite3.Database(path.join(__dirname, options.databasefile), (err) => {
  if (err) {
    console.error('err.message')
    return
  } else {
    console.log(`using database file: ${options.databasefile}`)
  }
})
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

app.listen(options.port)

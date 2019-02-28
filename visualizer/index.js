const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose() // TODO: delete??
const dayjs = require('dayjs')
const commandLineArgs = require('command-line-args')
// const { dump } = require('dumper.js') // TODO: use

const commandLineOptions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 9090 },
  { name: 'databasefile', alias: 'd', type: String, defaultValue: '../heat_tech.db' },
  { name: 'pollingseconds', alias: 'P', type: Number, defaultValue: 60 }
]
const options = commandLineArgs(commandLineOptions)

const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: options.databasefile }
})

// const db = new sqlite3.Database(path.join(__dirname, options.databasefile), (err) => {
//   if (err) {
//     console.error('err.message')
//     return
//   } else {
//     console.log(`using database file: ${options.databasefile}`)
//   }
// })
// TODO: Split this up even further, so that this functions as an API server that serves the database information
// to a frontend, which polls every minute and redraws the content.

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/data', async function (req, res) {
  // TODO: handle req.query.daysAgoFrom and req.query.daysAgoTo validation
  let result = {}
  for (daysAgo = req.query.daysAgoFrom; daysAgo < req.query.daysAgoTo; daysAgo++) {
    const targetDayStart = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD 00:00:00')
    const targetDayEnd = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD 23:59:59')
    try {
      const rows = await knex.table('temperature_and_humidity')
                             .select('temperature', 'created_at')
                             .where('created_at', '>', targetDayStart)
                             .where('created_at', '<', targetDayEnd)
                             .limit(5)
      // TODO: reduce results here, name keys minutesAfterMidnight, so 9:30am's key would be 570

      result[dayjs(targetDayStart).format('dddd')] = rows
    } catch (err) {
      console.log(err)
    }
  }
  // dump(result)
  res.json(result)
})

app.get('/echarts.js', function (req, res) {
  // TODO: probably should switch to the npm version and build with Webpack
  res.sendFile(path.join(__dirname + '/assets/echarts-4-1-0/echarts.common.min.js'))
})

app.listen(options.port)

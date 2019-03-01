const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose() // TODO: delete??
const dayjs = require('dayjs')
const commandLineArgs = require('command-line-args')
// const { dump } = require('dumper.js') // TODO: use

const commandLineOptions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 9090 },
  { name: 'databasefile', alias: 'd', type: String, defaultValue: '../heat_tech.db' }
  // { name: 'pollingseconds', alias: 'P', type: Number, defaultValue: 60 }
  // TODO: group by
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

function generateMinuteKeys (minutes = 30, startMinutes = 540, endMinutes = 1080) {
  let minuteKeys = []
  for (let accumulator = startMinutes; accumulator <= endMinutes; accumulator += minutes) {
    minuteKeys.push(accumulator.toString())
  }
  return minuteKeys
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

function generateWithNearestMinuteKeys (minuteKeys, minuteSteppage, convertedRows) {
  let minuteKeyLowestIndex = 0
  let minutesIndex = 0
  let result = {}

  while (minutesIndex <= convertedRows.length) {
    if (!result[minuteKeys[minuteKeyLowestIndex]]) {
      result[minuteKeys[minuteKeyLowestIndex]] = []
    }

    if (convertedRows[minutesIndex] && (convertedRows[minutesIndex].minutes > (parseInt(minuteKeys[minuteKeyLowestIndex]) + minuteSteppage / 2))) {
      minuteKeyLowestIndex++
    } else {
      if (convertedRows[minutesIndex]) {
        result[minuteKeys[minuteKeyLowestIndex]].push(convertedRows[minutesIndex].temperature)
      }
      minutesIndex++
    }
  }
  // console.log('1', result)

  // reduces results, name keys minutesAfterMidnight, so 9:30am's key would be 570
  const keys = Object.keys(result)
  if (keys) {
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (result[key].length > 0) {
        result[key] = result[key].reduce((acc, temperature) => {
          return acc + temperature
        }) / result[key].length
      } else {
        result[key] = null
      }
    }
  } else {
    // I don't know. It should always have values
  }
  // console.log('2', result)
  return result
}

app.get('/data', async function (req, res) {
  // TODO: handle req.query.daysAgoFrom and req.query.daysAgoTo validation
  let result = {}
  for (daysAgo = req.query.daysAgoFrom; daysAgo < req.query.daysAgoTo; daysAgo++) {
    const targetDayStart = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD 00:00:00')
    const targetDayEnd = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD 23:59:59')
    const minuteSteppage = 30
    const minuteKeys = generateMinuteKeys(minuteSteppage)

    try {
      const rows = await knex.table('temperature_and_humidity')
                             .select('temperature', 'created_at')
                             .where('created_at', '>', targetDayStart)
                             .where('created_at', '<', targetDayEnd)
                             .orderBy('created_at', 'asc') // Will already be sorted, but this is to prevent any possible bugs
                             .limit(1440) // 1440 minutes per day
      // TODO: move this into the generateWithNearestMinuteKeys function?
      const convertedRows = rows.map(row => {
        // minutes since midnight
        return {minutes: dayjs(row.created_at).diff(targetDayStart, 'minute'), temperature: row.temperature}
      })
      const groupedByMinutes = generateWithNearestMinuteKeys(minuteKeys, minuteSteppage, convertedRows)

      result[dayjs(targetDayStart).format('dddd')] = groupedByMinutes
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

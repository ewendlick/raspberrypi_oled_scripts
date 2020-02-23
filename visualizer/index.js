const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3').verbose() // TODO: delete??
const dayjs = require('dayjs')
const commandLineArgs = require('command-line-args')
// const { dump } = require('dumper.js') // TODO: use // dump(result)

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

const getPastDate = async function (date) {
  const targetDate = dayjs(day).format('YYYY-MM-DD')

  if (!targetDate.isBefore(dayjs)) {
    console.log('Attempted to get invalid date')
    return
  }

  try {
    const row = await knex.table('temperature_and_humidity_cache')
                          .select('json_data')
                          .where('steppage', 30)
                          .where('date', date)
                          .limit(1)
  } catch (err) {
    console.error(err)
  }

  console.log(row)
  if (rows.length > 1) {
    return row
  } else {
    // run the thing, build it, save it, return it
    try {
      // TODO: build the content to go in
      console.log(row)
      await knex.table('temperature_and_humidity_cache')
                .insert({steppage: 30, json_data: row, date: targetDate, created_at: dayjs().format('YYYY-MM-DD HH:MM:ss')})
      getPastDate(date)
    } catch (err) {
      console.error(err)
    }
  }
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
      // Check if past
      if (targetDayStart.isBefore(dayjs) && false) {
        
        // .....WORKING HERE
        // const getPastDate (date) {
      } else {
        const rows = await knex.table('temperature_and_humidity_home')
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
      }
      result[dayjs(targetDayStart).format('dddd')] = groupedByMinutes
    } catch (err) {
      console.log(err)
    }
  }
  res.json(result)
})

app.get('/echarts.js', function (req, res) {
  // TODO: probably should switch to the npm version and build with Webpack
  res.sendFile(path.join(__dirname + '/assets/echarts-4-1-0/echarts.common.min.js'))
})

app.use(express.static('assets/images'))

app.listen(options.port)

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
const Twitter = require('twitter')
const request = require('request')
const util = require('util')
const get = util.promisify(request.get)
const post = util.promisify(request.post)
let token, currentRules, stream
let timeout = 0

require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const consumer_key = process.env.TWITTER_API_KEY
const consumer_secret = process.env.TWITTER_API_SECRET_KEY

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const bearerTokenURL = new URL('https://api.twitter.com/oauth2/token')
const streamURL = new URL('https://api.twitter.com/labs/1/tweets/stream/filter')
const rulesURL = new URL('https://api.twitter.com/labs/1/tweets/stream/filter/rules')

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function(req, res) {
  res.render('index.ejs', {})
})

io.on('connection', socket => {

  socket.on("start", function() {
    const rules = setQuery('alldaytechkech', 'gzendmast')
    getSearches()
    defineRules("start", rules)
  })

  socket.on("newSearch", async function(username_1, username_2) {
    const rules = await setQuery('username_1', 'username_2')
    // stuur search naar mongodb database voor popular search-log
    const search = await defineSearchLog(username_1, username_2)
    defineRules("update", rules)
    console.log(search)
    addSearch(search)
  })

  socket.on("popular_searches", function() {
    setTimeout(function() {
      getSearches()
    }, 8000);

  })


  socket.on('disconnect', function() {
    console.log('user has left the building')
    // stream.emit('user_left')
  })

})


function setQuery(username_1, username_2) {
  if (username_2 == "User 2") {
    console.log("user 1 is ingevuld, user 2 niet")
    const rules = [{
      'value': `from:${username_1}`,
      'tag': `User_1: ${username_1}`
    }, ]
    return rules
  } else if (username_1 == "User 1") {
    console.log("user 2 is ingevuld, user 1 niet")
    const rules = [{
      'value': `from:${username_2}`,
      'tag': `User_2: ${username_2}`
    }, ]
    return rules
  } else {
    console.log("beide zijn ingevuld")
    const rules = [{
      'value': `from:${username_1}`,
      'tag': `User_1: ${username_1}`
    }, {
      'value': `from:${username_2}`,
      'tag': `User_2: ${username_2}`

    }, ]
    return rules
  }
}

function defineSearchLog(username_1, username_2) {
  if (username_1 == "User 1") {
    const search = {
      "username": username_2
    }
    return search
  } else if (username_2 == "User 2") {
    const search = {
      "username": username_1
    }
    return search
  } else {
    const search = {
      "username": `${username_1} & ${username_2}`
    }
    return search
  }
}

async function defineRules(state, rules) {
  try {
    // Exchange your credentials for a Bearer token
    token = await bearerToken({
      consumer_key,
      consumer_secret
    })
  } catch (e) {
    console.error(`Could not generate a Bearer token. Please check that your credentials are correct and that the Filtered Stream preview is enabled in your Labs dashboard. (${e})`)
    process.exit(-1)
  }

  if (state == "start") {
    try {
      // Gets the complete list of rules currently applied to the stream
      currentRules = await getAllRules(token)

      // // Delete all rules. Comment this line if you want to keep your existing rules.
      await deleteAllRules(currentRules, token)

      // // Add rules to the stream. Comment this line if you want to keep your existing rules.
      await setRules(rules, token)
      console.log(token)

      openConnection(token)
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }
  } else if (state == "update") {
    try {
      // Gets the complete list of rules currently applied to the stream
      currentRules = await getAllRules(token)

      // // Delete all rules. Comment this line if you want to keep your existing rules.
      await deleteAllRules(currentRules, token)

      // // Add rules to the stream. Comment this line if you want to keep your existing rules.
      await setRules(rules, token)
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }
  }
}

async function bearerToken(auth) {
  const requestConfig = {
    url: bearerTokenURL,
    auth: {
      user: consumer_key,
      pass: consumer_secret,
    },
    form: {
      grant_type: 'client_credentials',
    },
  }

  const response = await post(requestConfig)
  const body = JSON.parse(response.body)

  if (response.statusCode !== 200) {
    const error = body.errors.pop()
    throw Error(`Error ${error.code}: ${error.message}`)
    return null
  }

  return JSON.parse(response.body).access_token
}

async function getAllRules(token) {
  const requestConfig = {
    url: rulesURL,
    auth: {
      bearer: token
    }
  }

  const response = await get(requestConfig)
  if (response.statusCode !== 200) {
    throw new Error(response.body)
    return null
  }

  return JSON.parse(response.body)
}

async function deleteAllRules(rules, token) {
  if (!Array.isArray(rules.data)) {
    return null
  }

  const ids = rules.data.map(rule => rule.id)

  const requestConfig = {
    url: rulesURL,
    auth: {
      bearer: token
    },
    json: {
      delete: {
        ids: ids
      }
    }
  }

  const response = await post(requestConfig)
  if (response.statusCode !== 200) {
    throw new Error(JSON.stringify(response.body))
    return null
  }

  return response.body
}

async function setRules(rules, token) {
  const requestConfig = {
    url: rulesURL,
    auth: {
      bearer: token
    },
    json: {
      add: rules
    }
  }

  const response = await post(requestConfig)
  if (response.statusCode !== 201) {
    throw new Error(JSON.stringify(response.body))
    return null
  }

  return response.body
}

function openConnection(token) {
  // Listen to the stream.
  // This reconnection logic will attempt to reconnect when a disconnection is detected.
  // To avoid rate limites, this logic implements exponential backoff, so the wait time
  // will increase if the client cannot reconnect to the stream.
  const connect = () => {
    try {
      stream = streamConnect(token)
      // followerGet = followerConnect(token)
      stream.on('timeout', async () => {
        // Reconnect on error
        console.warn('A connection error occurred. Reconnecting…')
        timeout++
        stream.abort()
        await sleep((2 ** timeout) * 1000)
        connect()
      })

      stream.on('user_left', function() {
        console.log('user has left, closing connnection now')
        stream.abort()
      })

    } catch (e) {
      connect()
    }
  }
  connect()
}

function streamConnect(token) {
  // Listen to the stream
  const config = {
    url: 'https://api.twitter.com/labs/1/tweets/stream/filter?expansions=author_id',
    auth: {
      bearer: token,
    },
    timeout: 20000,
  }

  const stream = request.get(config)

  stream.on('data', data => {
    try {
      const json = JSON.parse(data)
      console.log(json)

      if (json.connection_issue) {
        stream.emit('timeout')
        console.log('issue, timeout')
        io.emit("conn_issue", json)
      } else {
        console.log('geen issues, emit newtweet met json, en GET followers')
        io.emit("new_tweet", json)
      }
    } catch (e) {
      // Heartbeat received. Do nothing.
    }

  }).on('error', error => {
    if (error.code === 'ESOCKETTIMEDOUT') {
      stream.emit('timeout')
    }
  })

  return stream
}

function followerConnect(token) {
  console.log('fwc' + token)
}

async function sleep(delay) {
  return new Promise((resolve) =>
    setTimeout(() =>
      resolve(true), delay))
}

async function addSearch(search) {
  const client = await MongoClient.connect(url, options)
  const db = client.db(dbName)
  console.log("Connected correctly to server to store search")
  const item = await db.collection('twitter_searches').insertOne(search)
  console.log('big data at your service')
  client.close()
  return
}

async function getSearches() {
  console.log('searches getten')
  const client = await MongoClient.connect(url, options)
  const db = client.db(dbName)
  console.log("Connected correctly to server to retrieve search")
  const search = await db.collection('twitter_searches').aggregate([{
    $sample: {
      size: 1
    }
  }]).toArray()
  client.close()
  console.log(search)
  // io.emit("recent_search", search[0].username)
}

http.listen(port, () => {
  console.log('App listening on: ' + port)
})
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

const bearerTokenURL = new URL('https://api.twitter.com/oauth2/token')
const streamURL = new URL('https://api.twitter.com/labs/1/tweets/stream/filter')
const rulesURL = new URL('https://api.twitter.com/labs/1/tweets/stream/filter/rules')

const token = generateToken()

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function(req, res) {
  res.render('index.ejs', {})
})

io.on('connection', socket => {

  socket.on("start", function() {
    const rules = setQuery('alldaytechkech', 'alldayoptimism')
    defineRules("start", rules)
  })

  socket.on("newSearch", function(username_1, username_2) {
    const rules = setQuery('username_1', 'username_2')
    // stuur search naar mongodb database voor popular search-log
    defineRules("update", rules)
  })

  socket.on('new_tweet', function(tweetObject) {
    console.log('yeeeeeet')
    // console.log(tweetObject)
    // vgm wordt deze niet eens uitgevoerd maar gooi ik direct de emit naar client lol oeps
    socket.broadcast.emit('new_tweet', tweetObject)
  })

  socket.on('disconnect', function() {
    console.log('user has left the building')
    stream.emit('user_left')
  })

})

function generateToken() {
  try {
    // Exchange your credentials for a Bearer token
    token = await bearerToken({
      consumer_key,
      consumer_secret
    })
    return token
  } catch (e) {
    console.error(`Could not generate a Bearer token. Please check that your credentials are correct and that the Filtered Stream preview is enabled in your Labs dashboard. (${e})`)
    process.exit(-1)
  }
}

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

async function defineRules(state, rules) {
  if (state == "start") {
    try {
      // Gets the complete list of rules currently applied to the stream
      currentRules = await getAllRules(token)

      // // Delete all rules. Comment this line if you want to keep your existing rules.
      await deleteAllRules(currentRules, token)

      // // Add rules to the stream. Comment this line if you want to keep your existing rules.
      await setRules(rules, token)
      console.log("checkpoint1")
      console.log(token)
      console.log("kreeg ik een token?")

      // openConnection(token)
    } catch (e) {
      console.error(e)
      process.exit(-1)
    }
  } else if (state == "refresh") {
    try {
      // Gets the complete list of rules currently applied to the stream
      currentRules = await getAllRules(token)
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
      followerGet = followerConnect(token)
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

}

async function sleep(delay) {
  return new Promise((resolve) =>
    setTimeout(() =>
      resolve(true), delay))
}

//
// function getInfo_1(username_1, latest_tweetObject) {
//   const filterOptions = {
//     screen_name: username_1,
//     count: 1
//   }
//
//   const getData = new Promise((resolve) => {
//     twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
//       const tweets = data.map(item => ({
//         text: item.text,
//         user_name: item.user.name,
//         user_screen_name: item.user.screen_name,
//         followers: item.user.followers_count
//       }))
//       const tweetObject = tweets[0]
//       resolve(tweetObject)
//     })
//   })
//
//   getData
//     .then(tweetObject => {
//       checkText_1(username_1, tweetObject, latest_tweetObject)
//     })
//     .catch(err => {
//       console.log(err)
//     })
// }
//
// function checkText_1(username_1, tweetObject, latest_tweetObject) {
//   const tweetText = tweetObject.text
//   const latest_tweetText = latest_tweetObject.text
//
//   if (tweetText == latest_tweetText) {
//     console.log('same old')
//     refreshTweet_1(username_1, tweetObject)
//   } else {
//     console.log('sunshine and rainbows: new tweet!')
//     io.emit("new_tweet", username_1, tweetObject)
//   }
// }
//
// function checkFollowers_1(username_1, followers, latest_followers) {
//   if (followers == latest_followers) {
//     console.log('same old fam')
//     refreshTweet_1(username_1, followers)
//   } else {
//     console.log('new follower count!')
//     io.emit("new_tweet", username_1, followers)
//   }
// }
//
// function refreshTweet_1(username_1, tweetObject, latest_tweet_text) {
//   getInfo_1(username_1, tweetObject, latest_tweet_text)
// }
//
// function getInfo_2(username_2, latest_tweetObject) {
//   const filterOptions = {
//     screen_name: username_2,
//     count: 1
//   }
//
//   const getData = new Promise((resolve) => {
//     twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
//       const tweets = data.map(item => ({
//         text: item.text,
//         user_name: item.user.name,
//         user_screen_name: item.user.screen_name,
//         followers: item.user.followers_count
//       }))
//       const tweetObject = tweets[0]
//       resolve(tweetObject)
//     })
//   })
//
//   getData
//     .then(tweetObject => {
//       checkText_2(username_2, tweetObject, latest_tweetObject)
//     })
//     .catch(err => {
//       console.log(err)
//     })
// }
//
// function checkText_2(username_2, tweetObject, latest_tweetObject) {
//   const tweetText = tweetObject.text
//   const latest_tweetText = latest_tweetObject.text
//
//   if (tweetText == latest_tweetText) {
//     console.log('same old')
//     refreshTweet_2(username_2, tweetObject)
//   } else {
//     console.log('sunshine and rainbows: new tweet!')
//     io.emit("new_tweet_2", username_2, tweetObject)
//   }
// }
//
// function checkFollowers_2(username_2, followers, latest_followers) {
//   if (followers == latest_followers) {
//     console.log('same old fam')
//     refreshTweet_2(username_2, followers)
//   } else {
//     console.log('new follower count!')
//     io.emit("new_tweet_2", username_2, followers)
//   }
// }



http.listen(port, () => {
  console.log('App listening on: ' + port)
})
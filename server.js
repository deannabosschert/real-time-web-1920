const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
const Twitter = require('twitter')
// let username_1_1 = "Twitter user 1"
// let username_1_2 = "Twitter user 2"


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}


app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function(req, res) {
  res.render('index.ejs', {})
})

io.on('connection', socket => {

  socket.on("start", function(username_1, username_2) {
    console.log(username_1)
    console.log(username_2)
    if (username_2 == "empty") {
      getInfo_1(username_1, '', '')
    } else if (username_1 = "empty") {
      getInfo_2(username_2, '', '')
    }
  })

  socket.on('new_tweet_1', function(username_1, tweetObject) {
    socket.broadcast.emit('new_tweet_1', username_1, tweetObject)
  })

  socket.on('new_follower_1', function(username_1, followers) {
    socket.broadcast.emit('new_follower_1', username_1, followers)
  })

  socket.on('refresh_tweet_1', function(username_1, latest_tweetObject) {
    getInfo_1(username_1, latest_tweetObject)
  })

  socket.on('new_tweet_2', function(username_2, tweetObject) {
    socket.broadcast.emit('new_tweet_2', username_2, tweetObject)
  })

  socket.on('new_follower_2', function(username_2, followers) {
    socket.broadcast.emit('new_follower_2', username_2, followers)
  })

  socket.on('refresh_tweet_2', function(username_2, latest_tweetObject) {
    getInfo_2(username_2, latest_tweetObject)
  })
})


function getInfo_1(username_1, latest_tweetObject) {
  const filterOptions = {
    screen_name: username_1,
    count: 1
  }

  const getData = new Promise((resolve) => {
    twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
      const tweets = data.map(item => ({
        text: item.text,
        user_name: item.user.name,
        user_screen_name: item.user.screen_name,
        followers: item.user.followers_count
      }))
      const tweetObject = tweets[0]
      resolve(tweetObject)
    })
  })

  getData
    .then(tweetObject => {
      checkText_1(username_1, tweetObject, latest_tweetObject)
    })
    .catch(err => {
      console.log(err)
    })
}

function checkText_1(username_1, tweetObject, latest_tweetObject) {
  const tweetText = tweetObject.text
  const latest_tweetText = latest_tweetObject.text

  if (tweetText == latest_tweetText) {
    console.log('same old')
    refreshTweet_1(username_1, tweetObject)
  } else {
    console.log('sunshine and rainbows: new tweet!')
    io.emit("new_tweet_1", username_1, tweetObject)
  }
}

function checkFollowers_1(username_1, followers, latest_followers) {
  if (followers == latest_followers) {
    console.log('same old fam')
    refreshTweet_1(username_1, followers)
  } else {
    console.log('new follower count!')
    io.emit("new_tweet_1", username_1, followers)
  }
}

function refreshTweet_1(username_1, tweetObject, latest_tweet_text) {
  getInfo_1(username_1, tweetObject, latest_tweet_text)
}

function getInfo_2(username_2, latest_tweetObject) {
  const filterOptions = {
    screen_name: username_2,
    count: 1
  }

  const getData = new Promise((resolve) => {
    twitterClient.get('statuses/user_timeline', filterOptions, function(err, data) {
      const tweets = data.map(item => ({
        text: item.text,
        user_name: item.user.name,
        user_screen_name: item.user.screen_name,
        followers: item.user.followers_count
      }))
      const tweetObject = tweets[0]
      resolve(tweetObject)
    })
  })

  getData
    .then(tweetObject => {
      checkText_2(username_2, tweetObject, latest_tweetObject)
    })
    .catch(err => {
      console.log(err)
    })
}

function checkText_2(username_2, tweetObject, latest_tweetObject) {
  const tweetText = tweetObject.text
  const latest_tweetText = latest_tweetObject.text

  if (tweetText == latest_tweetText) {
    console.log('same old')
    refreshTweet_2(username_2, tweetObject)
  } else {
    console.log('sunshine and rainbows: new tweet!')
    io.emit("new_tweet_2", username_2, tweetObject)
  }
}

function checkFollowers_2(username_2, followers, latest_followers) {
  if (followers == latest_followers) {
    console.log('same old fam')
    refreshTweet_2(username_2, followers)
  } else {
    console.log('new follower count!')
    io.emit("new_tweet_2", username_2, followers)
  }
}

function refreshTweet_2(username_2, tweetObject, latest_tweet_text) {
  getInfo_2(username_2, tweetObject, latest_tweet_text)
}
http.listen(port, () => {
  console.log('App listening on: ' + port)
})
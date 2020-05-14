const socket = io()
// const abort_stream = document.querySelector(".abort_stream")
const input1 = document.querySelector(".header_nav_searchBar_1_textInput")
const input2 = document.querySelector(".header_nav_searchBar_2_textInput")
const tweets_1 = document.querySelector(".tweets_1")
const tweets_2 = document.querySelector(".tweets_2")
const searchBar_1 = document.querySelector(".header_nav_searchBar_1")
const searchBar_2 = document.querySelector(".header_nav_searchBar_2")
const username_1_field = document.querySelector(".main_user_1_name")
const username_2_field = document.querySelector(".main_user_2_name")
const username_1followers_count = 20;
const username_2followers_count = 300;
const username_1_hidden = document.querySelector(".username_1_hidden")
const username_2_hidden = document.querySelector(".username_2_hidden")
username_1_hidden.innerHTML = "User 1"
username_2_hidden.innerHTML = "alldayoptimism"

drawChart(username_1_hidden.innerHTML, username_2_hidden.innerHTML, 0, 0)

// abort_stream.addEventListener("click", function(event) {
//   socket.emit("disconnection")
// })
socket.emit("start")


searchBar_1.addEventListener("submit", function(event) {
  // when searching for another username, delete the results of the previous search
  while (tweets_1.firstChild) {
    tweets_1.removeChild(tweets_1.firstChild);
  }
  const username_1 = input1.value
  const username_2 = username_2_hidden.innerHTML

  socket.emit("newSearch", username_1, username_2)
  // input1.value = ""
  return false
}, false)

searchBar_2.addEventListener("submit", function(event) {
  // when searching for another username, delete the results of the previous search
  while (tweets_2.firstChild) {
    tweets_2.removeChild(tweets_2.firstChild);
  }

  const username_2 = input2.value
  const username_1 = username_1_hidden.innerHTML

  socket.emit("newSearch", username_1, username_2)
  // input2.value = ""
  return false
}, false)
// //
// searchBar_2.addEventListener("submit", function(event) {
//   event.preventDefault()
//   // when searching for another username, delete the results of the previous search
//   while (tweets_2.firstChild) {
//     tweets_2.removeChild(tweets_2.firstChild);
//   }
//
//   const username_2 = input2.value
//   socket.emit("start", "empty", username_2)
//   input2.value = ""
//   return false
// }, false)
//
socket.on("new_tweet", function(tweetObject) {
  console.log("maintweetnew")
  console.log(tweetObject)
  // if (tweetObject.connection_issue = "TooManyConnections") {
  //   const errorDetail = tweetObject.detail
  //   showError(errorDetail)
  // } else {
  const username_tag = tweetObject.matching_rules[0].tag
  const user = username_tag.charAt(5)
  console.log(user)
  addTweet(user, tweetObject)
  // }
  // const whichUser = checkUser(json)
  // addTweet_1(tweetObject)
})
//
// socket.on("new_followers_1", function(username_1, followers) {
//   addFollower_1(followers)
//   socket.emit("refresh_tweet_1", username_1, tweetObject)
// })
//

function showError(errorDetail) {
  const li = document.createElement("li")
  li.innerHTML = errorDetail
  tweets_1.appendChild(li)
  window.scrollTo(0, tweets_1.scrollHeight)
}

function addTweet(user, tweetObject) {
  console.log(user)
  console.log(tweetObject)
  const tweetText = tweetObject.data.text
  const username_tag = tweetObject.matching_rules[0].tag
  const username_display = tweetObject.includes.users[0].name
  const username = username_1_tag.split(' ');
  // tweetObject.json.matching_rules[0].tag
  // const followers_1 = tweetObject.followers
  `username_${user}_field`.innerHTML = username_display `username_${user}_hidden`.innerHTML = username[1]

  const li = document.createElement("li")
  li.innerHTML = `tweetText_${user}`
  `tweets_${user}`.appendChild(li)
  // window.scrollTo(tweet)
  window.scrollTo(0, `tweets_${user}`.scrollHeight)
  // drawChart(username_1_display, "User 2", followers_1, "")
}
//
// function addFollower_1(followers) {
//   console.log(followers)
// }
//
//
// socket.on("new_tweet_2", function(username_2, tweetObject) {
//   addTweet_2(username_2, tweetObject)
//   socket.emit("refresh_tweet_2", username_2, tweetObject)
// })
//
// socket.on("new_followers_2", function(username_2, followers) {
//   addFollower_2(followers)
//   socket.emit("refresh_tweet_2", username_2, tweetObject)
// })
//
// function addTweet_2(username_2, tweetObject) {
//   const tweetText_2 = tweetObject.text
//   const username_2_display = tweetObject.user_name
//   const followers_2 = tweetObject.followers
//
//   const username_2_field = document.querySelector(".main_user_2_name")
//   username_2_field.innerHTML = username_2_display
//
//
//   const li = document.createElement("li")
//   li.innerHTML = tweetText_2
//   tweets_2.appendChild(li)
//   // window.scrollTo(tweet)
//   window.scrollTo(0, tweets_2.scrollHeight)
//   drawChart("User 1", username_2_display, "", followers_2)
// }
//
// function addFollower_2(followers) {
//   console.log(followers)
// }

function drawChart(username_1, username_2, followers_count_1, followers_count_2) {
  const username_1_display = username_1
  const username_2_display = username_2

  if (followers_count_1 > followers_count_2) {
    const username_1_color = '#1DA1F2'
    const username_2_color = '#657786'
  } else {
    const username_2_color = '#1DA1F2'
    const username_1_color = '#657786'
  }


  let ctx = document.getElementById("myChart")

  let data = {
    labels: [username_1_display, username_2_display],
    datasets: [{
      barThickness: '80px',
      data: [followers_count_1, followers_count_2],
      backgroundColor: [
        '#657786',
        '#AAB8C2'
      ],
      borderColor: [
        '#E1E8ED',
        '#E1E8ED'
      ],
      borderWidth: [2, 2]
    }]
  }



  let myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      "hover": {
        "animationDuration": 0
      },
      "animation": {
        "duration": 1,
        "onComplete": function showFollowers() {
          var chartInstance = this.chart
          ctx = chartInstance.ctx
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'

          this.data.datasets.forEach(function(dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i)
            meta.data.forEach(function(bar, index) {
              var data = dataset.data[index];
              ctx.fillText(data, bar._model.x, bar._model.y - 5)
            })
          })
        }
      },
      legend: {
        "display": false
      },
      tooltips: {
        "enabled": true
      },
      scales: {
        yAxes: [{
          display: false,
          gridLines: {
            display: false
          },
          ticks: {
            max: Math.max(...data.datasets[0].data) + 40,
            display: true,
            beginAtZero: true,
          }
        }],
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true,
            display: true
          }
        }]
      }
    }
  })

}
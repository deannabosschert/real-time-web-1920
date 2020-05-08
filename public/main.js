const socket = io()
const tweets1 = document.querySelector(".tweets1")
const searchBar_1 = document.querySelector(".header_nav_searchBar_1")
const input1 = document.querySelector(".header_nav_searchBar_1_textInput")
const tweets2 = document.querySelector(".tweets2")
const searchBar_2 = document.querySelector(".header_nav_searchBar_2")
const input2 = document.querySelector(".header_nav_searchBar_2_textInput")
// let username_1_display = "TU 1"
// let username_2_display = "TU 2"
const username_1followers_count = 20;
const username_2followers_count = 300;

drawChart("Twitter user 1", "Twitter user 2", 0, 0)


searchBar_1.addEventListener("submit", function(event) {
  event.preventDefault()
  // when searching for another username, delete the results of the previous search
  while (tweets1.firstChild) {
    tweets1.removeChild(tweets1.firstChild);
  }
  const username_1 = input1.value
  socket.emit("start", username_1, "empty")
  input1.value = ""
  return false
}, false)

searchBar_2.addEventListener("submit", function(event) {
  event.preventDefault()
  // when searching for another username, delete the results of the previous search
  while (tweets2.firstChild) {
    tweets2.removeChild(tweets2.firstChild);
  }

  const username_2 = input2.value
  socket.emit("start", "empty", username_2)
  input2.value = ""
  return false
}, false)

socket.on("new_tweet_1", function(username_1, tweetObject) {
  addTweet_1(username_1, tweetObject)
  socket.emit("refresh_tweet_1", username_1, tweetObject)
})

socket.on("new_followers_1", function(username_1, followers) {
  addFollower_1(followers)
  socket.emit("refresh_tweet_1", username_1, tweetObject)
})

function addTweet_1(username_1, tweetObject) {
  const tweetText_1 = tweetObject.text
  const username_1_display = tweetObject.user_name
  const followers_1 = tweetObject.followers

  const username_1_field = document.querySelector(".main_user_1_name")
  username_1_field.innerHTML = username_1_display


  const li = document.createElement("li")
  li.innerHTML = tweetText_1
  tweets1.appendChild(li)
  // window.scrollTo(tweet)
  window.scrollTo(0, tweets1.scrollHeight)
  drawChart(username_1_display, "User 2", followers_1, "")
}

function addFollower_1(followers) {
  console.log(followers)
}


socket.on("new_tweet_2", function(username_2, tweetObject) {
  addTweet_2(username_2, tweetObject)
  socket.emit("refresh_tweet_2", username_2, tweetObject)
})

socket.on("new_followers_2", function(username_2, followers) {
  addFollower_2(followers)
  socket.emit("refresh_tweet_2", username_2, tweetObject)
})

function addTweet_2(username_2, tweetObject) {
  const tweetText_2 = tweetObject.text
  const username_2_display = tweetObject.user_name
  const followers_2 = tweetObject.followers

  const username_2_field = document.querySelector(".main_user_2_name")
  username_2_field.innerHTML = username_2_display


  const li = document.createElement("li")
  li.innerHTML = tweetText_2
  tweets2.appendChild(li)
  // window.scrollTo(tweet)
  window.scrollTo(0, tweets2.scrollHeight)
  drawChart("User 1", username_2_display, "", followers_2)
}

function addFollower_2(followers) {
  console.log(followers)
}





function calculateWinningUser() {
  if (username_1.followers_count > username_2.followers_count) {
    const username_1_color = '#1DA1F2'
    const username_2_color = '#657786'
  } else {
    const username_2_color = '#1DA1F2'
    const username_1_color = '#657786'
  }
}


function drawChart(username_1, username_2, followers_count_1, followers_count_2) {
  const username_1_display = username_1
  const username_2_display = username_2

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
# Real-Time Web @cmda-minor-web · 2019-2020
# Twitter Feuds

https://real-time-dingen.herokuapp.com/
[screenshot of website]


<details>
  <summary><strong>Table of Contents</strong> (click to expand)</summary>

<!-- toc -->

- [✅ To-do](#--to-do)
- [📋 Concept](#---concept)
- [👯🏿‍ Features (+ wishlist)](#------features----wishlist-)
- [⚙️ Installation](#---installation)
    + [Dependencies](#dependencies)
- [🧑🏼‍ Data Life Cycle](#------data-life-cycle)
- [🌍 Design patterns](#---design-patterns)
- [👍🏽 Best practices](#-----best-practices)
- [🗃 Data](#---data)
  * [🐒 API](#---api)
    + [Properties](#properties)
    + [Rate limiting](#rate-limiting)
  * [💽 Data cleaning](#---data-cleaning)
- [🏫 Assignment](#---assignment)
  * [Learning goals](#learning-goals)
  * [Week 1 - Hello Server 📤](#week-1---hello-server---)
  * [Week 2 - Sharing is caring 👯](#week-2---sharing-is-caring---)
  * [Week 3 - Let’s take this show on the road 🛣️](#week-3---let-s-take-this-show-on-the-road----)
  * [Rubric](#rubric)
- [ℹ️ Resources](#---resources)
  * [Credits](#credits)
  * [Small inspiration sources](#small-inspiration-sources)
- [🗺️ License](#----license)

<!-- tocstop -->

</details>

## ✅ To-do
- [ ] Wait another month for stream limit to reset..
- Add get-request to follower count, alongside streaming-get

## 📋 Concept
_What does your app do, what is the goal? (passing butter)_

### Twitter fights
Compare the follower count of two rivaling twitter accounts over time, and see which one is winning in popularity.

## Data Life Cycle
![data life cycle](https://github.com/deannabosschert/real-time-web-1920/blob/master/public/img/documentation/dlc_complete-01.png)

## 👯🏿‍ Features (+ wishlist)
_What would you like to add (feature wishlist / backlog)?_

- [ ] Line chart instead of bar chart

## ⚙️ Installation
Clone this repository to your own device:
```bash
$ git clone https://github.com/deannabosschert/real-time-web-1920.git
```
Then, navigate to this folder and run:

```bash
npm run dev
```
, or:

```bash
npm install
```

#### Dependencies
```json
  "dependencies": {
    "chart.js": "^2.9.3",
    "chartjs-plugin-annotation": "^0.5.7",
    "chartjs-plugin-datalabels": "^0.7.0",
    "dotenv": "^8.2.0",
    "ejs": "^3.1.2",
    "express": "^4.17.1",
    "heroku": "^7.39.5",
    "mongodb": "^3.5.6",
    "socket.io": "^2.3.0",
    "twitter": "^1.7.1",
  },
```

## 👍🏽 Best practices

- Work in branches, even if it's a one-man project. It helps staying focused on one feature until it's finished, and keeps your from doing 10 different things at the same time. Saves you merge conflicts, too.
- ^ also helps with 'closing' a feature, so you are more likely to move on to the next. Too little time, too much ideas.
- Commit early, commit often.
- Make single-purpose commits.
- Always fix your .gitignore-contents asap; node_modules or the like won't ever be pushed that way.
- Styling comes last. It's gonna change anyways so most of the time, it's better to fix the technical stuff first.
- Don't use declarations in the global scope.
- Start your project with writing down the future function names (pre-actors, basically).
- Make your own template for your readme
- Google, google, google. 99% of the time, it'll get you to the solution of your problem.
- Set timers for solving problems that aren't super relevant in the current sprint but you do would like to work on; 25 mins tops, otherwise you'll be stuck with this for too long.
- Make an actor diagram halfway through, it's a great reminder to refactor the code.
- Explicitly limit the scope of your functions
- Remember that most problems/features that have to do with the UI, can be fixed with mainly CSS.
- Do not use .innerHTML
- If there's an error, walk through your code from the top/beginning; explain it to your rubber ducky and state where certain data is passed.
- Implement useful error handling.

## 🗃 Data

### 🐒 API
_What external data source is featured in your project and what are its properties?_

Twitter API.
ChartsJS.

Na lang zoeken toch maar overstag gegaan met het gebruik van de Twitter-library.
Uiteindelijk die ook laten varen en gebruikgemaakt van de streaming-service van Twitter om het maxen van requests tegen te gaan. Realtime-functionaliteit bied ik aan dmv direct tonen van de tweets+data op de frontend, evenals het registreren van de 'top searches' middels MongoDB.

See data life cycle.

  ```
  async function sleep(delay) {}
  async function bearerToken(auth) {}
  async function getAllRules(token) {}
  async function deleteAllRules(rules, token) {}
  async function setRules(rules, token) {}
  function streamConnect(token) {}
```


#### Rate limiting
Apparently, you can only do up to an undefined (and they won't state the exact amount) number of calls to the twitter-streaming api.


## 🏫 Assignment
<details>
  <summary></strong> (click to expand)</summary>
> During this course I have learned how to build a meaningful real-time application. I have learned techniques to setup an open connection between the client and the server. This enabled me to send data in real-time both ways, at the same time.


### Learning goals

- _You can deal with real-time complexity_
- _You can handle real-time client-server interaction_
- _You can handle real-time data management_
- _You can handle multi-user support_


### Week 1 - Hello Server 📤

Goal: Build and deploy a unique barebone real-time app

### Week 2 - Sharing is caring 👯

Goal: Store, manipulate and share data between server-client

### Week 3 - Let’s take this show on the road 🛣️

Goal: Handle data sharing and multi-user support

</details>

### Rubric

[Rubric- detailed rating of my project](https://github.com/deannabosschert/real-time-web-1920/wiki/Rubric)
![screenshot of rubric](https://github.com/deannabosschert/real-time-web-1920/blob/master/src/img/documentation/rubric.png)

## ℹ️ Resources

### Credits

- Our superamazingteachers at the [minor WebDev @CMD](https://github.com/cmda-minor-web/)


## 🗺️ License

Author: [Deanna Bosschert](https://github.com/deannabosschert) , license by
[MIT](https://github.com/deannabosschert/real-time-web-1920/blob/master/LICENSE)

import './style.css'
import pLimit from 'p-limit'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Spam url</h1>
    <p>Call an url multiple time and aggregate the response code</p>
    <div class="card">
        <input type="text" id="url" placeholder="url" value="https://d3hhjkzdrnl9gr.cloudfront.net/plant-library-images/original/f684cfbd-ec6e-4e04-a006-808dac9a0d2f">
        <div>
            Number of parallel requests: <input type="number" id="requestCount" placeholder="Number of parallel requests" value="10">
        </div>
        <div>
            Requests: <input type="number" id="totalCount" placeholder="Total number of requests" value="10">
        </div>
        
        <button id="start" type="button">Start</button>
        <button id="stop" type="button">Stop</button>
    </div>
    <p id="results">
    </p>
  </div>
`

let isRunning = false
let responses = {}

const startEl = document.querySelector('#start')
const stopEl = document.querySelector('#stop')
const resultsEl = document.querySelector('#results')
const urlEl = document.querySelector('#url')
const requestCountEl = document.querySelector('#requestCount')
const totalCountEl = document.querySelector('#totalCount')

const updateUi = () => {
    resultsEl.innerHTML = `
        ${isRunning ? "Running..." : ""} <br/>
        <table>
        ${Object.keys(responses).map(key => `<tr><td>${key}</td><td>${responses[key]}</td></tr>`)}
        </table>
    `
}

const run = async (url) => {
    const result = await fetch(url, {cache: "no-store"})

    if (!responses[result.status]) {
        responses[result.status] = 0
    }

    responses[result.status] += 1
    updateUi()
    return true
}


const start = async () => {
    if (isRunning) {
        console.log("Already running")
        return
    }
    const url = urlEl.value
    const totalCount = Number.parseInt(totalCountEl.value)
    const parallelRequest = Number.parseInt(requestCountEl.value)

    console.log(url, parallelRequest, totalCount)

    isRunning = true
    updateUi()

    const limit = pLimit(parallelRequest)
    const runArray = Array(totalCount).fill().map(_ => limit(() => run(url)))

    console.log(runArray)

    await Promise.all(runArray)
    isRunning = false
    updateUi()
    console.log("done")
}

startEl.addEventListener('click', start)


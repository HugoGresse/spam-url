import pLimit from 'p-limit'
import axios from 'axios'

const instance = axios.create({
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});

const responses = { "call": 0, "timeout": 0 }

const run = async (url) => {
    return new Promise(resolve => {
        responses["call"] += 1
        instance.get(url)
            .then( (resp) =>  {
                const code = resp.status || resp.statusCode
                if (!responses[code]) {
                    responses[code] = 0
                }

                responses[code] += 1

                console.log(JSON.stringify(responses, 0, 4))
            })
            .catch( (error) =>  {
                console.log(error)
                const errorName = error.message || "error"
                if (!responses[errorName]) {
                    responses[errorName] = 0
                }
                responses[errorName] += 1
            })
            .finally(() => {
                resolve()
            })
    })
}

const start = async () => {
    const [, , totalCount, parallelRequest, url] = process.argv
    console.log(totalCount, parallelRequest, url)

    const limit = pLimit(Number.parseInt(parallelRequest))
    const runArray = Array(Number.parseInt(totalCount)).fill().map(_ => limit(() => run(url)))

    console.log("Running now", runArray.length, "parallelRequest: " + parallelRequest)
    await Promise.all(runArray)
    console.log("<<<<<<<<<<<<<<< Done!")
    console.log(JSON.stringify(responses, 0, 4))
}

start()

import Cache from 'node-cache'
import fetch from 'node-fetch'

const myCache = new Cache({ stdTTL: 100, checkperiod: 120 })
const API_URL = 'https://api.plenty.network/analytics/tokens'

async function fetchData() {
  const response = await fetch(API_URL)
  const data = await response.json()
  myCache.set('apiData', data)
}

export default function fetchCoinsInfos(req, res) {
  const cachedData = myCache.get('apiData')
  if (cachedData) {
    res.status(200).json(cachedData)
  } else {
    fetchData().then(() => {
      const newData = myCache.get('apiData')
      res.status(200).json(newData)
    })
  }
}

const refreshInterval = 60
setInterval(fetchData, refreshInterval * 1000)

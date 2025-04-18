import axios from 'axios'

async function fetch(urn: string) {
  try {
    const apiKey = process.env.TZPRO_API_KEY
    const response = await axios.get(`https://api.tzpro.io/${urn}`, {
      headers: {
        'X-API-Key': apiKey,
      },
    })

    if (response.status === 200) {
      return response.data
    } else {
      console.error('Failed to fetch external data. Status code:', response.status)
    }
  } catch (error) {
    console.error('Error:', error)
  }

  return null
}

export async function getLastBlock() {
  const data = await fetch('explorer/tip')
  return {
    hash: data?.block_hash,
    date: data?.timestamp,
  }
}

export async function getPrices() {
  const data = await fetch('markets/tickers')
  const xtzPrice = data.filter(feed => feed.pair === 'XTZ_USD' && feed.exchange === 'kraken')[0].last as number
  const xtzEurPrice = data.filter(feed => feed.pair === 'XTZ_EUR' && feed.exchange === 'kraken')[0].last as number
  return { xtzPrice, usdToEur: xtzEurPrice / xtzPrice }
}

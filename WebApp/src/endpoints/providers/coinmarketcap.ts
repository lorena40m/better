import axios from 'axios'
import { Coin } from '../API'

const apiKey = process.env.COINMARKETCAP_API_KEY;
const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export async function getTop50Cryptos(pageSize, criteria: 'market_cap' | 'volume_24h') {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        start: 1,
        limit: pageSize,
        sort_dir: "desc",
        sort: criteria,
      },
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    if (response.status === 200) {
      return response.data.data.map(crypto => ({
        id: "", // TO FILL
        logo: "", // TO FILL
        name: crypto.name,
        ticker: crypto.symbol,
        decimals: Math.floor(0), // TO FILL
        lastPrice: Math.floor(crypto.quote.USD.price*100).toString(),
        circulatingSupplyOnChain: crypto.circulating_supply,
        holders: Math.floor(0).toString(), // TO FILL
      } as Coin)) as Coin[];
    }
    else {
      console.error(`Failed to fetch data. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
  }

  return null
}

import axios from 'axios'
import {getCoinData} from './tzkt'

async function fetch(urn: string) {
  try {
    const apiKey = process.env.TZPRO_API_KEY
    const response = await axios.get(`https://api.tzpro.io/${urn}`, {
      headers : { 
        'X-API-Key': apiKey,
      },
    }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch external data. Status code:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return null;
}

async function getLastBlockHash() {
  const data = await fetch('explorer/tip')
  return data?.block_hash
}

export async function getBlockDate() {
  const last_block = await getLastBlockHash()
  const data = await fetch(`explorer/block/${last_block}`)
  return data?.time ? (new Date(data.time)).toISOString() : null
}

export async function getXtzPrice() {
  const data = await fetch('markets/tickers')
  const binancePrice = data.filter(feed => feed.pair === 'XTZ_USDT' && feed.exchange === 'binance')[0]
  return Math.round(binancePrice.last * 100).toString()
}

export async function getWallet(address) {
  const data = await fetch(`explorer/account/${address}`)
  return {
    nativeBalance: data?.spendable_balance as string | null,
    operationCount: data?.n_tx_success as string | null,
  }
}

export async function getWalletTotalValue(address){
  let sum = 0
  try {
    const data = await fetch(`v1/wallets/${address}/balances`)
    //const data = await response.json()
  

    // Calculate total value in USD
    const totalValueUSD = data.reduce((sum, asset) => {
      const valueUSD = asset?.value_usd || "0"; // Default to "0" if value_usd is not present
      return sum + Number(valueUSD);
    }, 0);
    const totalValueInCents = Math.round(totalValueUSD*100)
    return totalValueInCents.toString()

  } catch (error) {
    console.error('Error:', error);
    return 0
  }
}

export async function getTokenSortedByValue(address: string ) {
  const assets = await fetch(`v1/wallets/${address}/balances`)
  const tokens = assets.filter(item => item.decimals !== 0);
  
  return (await Promise.all(tokens.map(async tokenData => {
    // Carefull: every NFT here is considered a token of the owner
    // Carefull 2: The owner can own thousands of tokens
    // Do we want to make thousands of request?
    // On the other side we don't want to miss some important tokens...
    // The answer would be to paginate, but will only be usefull for big wallets...
    // Or to have an index of course
    // console.log('tokenData', tokenData)
    const valueInUSD = Math.round(tokenData?.value_usd*100).toString()
    return {
      coin: await getCoinData(
        tokenData.contract,
        valueInUSD
      ),
      quantity: tokenData.balance,
      valueInUSD: valueInUSD, 
      lastTransferDate: "",
    } as Token
  })))
    .sort((a, b) => b.valueInUSD - a.valueInUSD) as Token[]
}

export async function getLastOperations(address, number) {
  if (address.startsWith('KT')) {
    return await fetch(`explorer/contract/${address}/calls?prim=1&order=desc&limit=${number}`)
  }
  else { 
    return await fetch(`explorer/account/${address}/operations?prim=1&order=desc&limit=${number}`)
  }
}

// TODO: convert the averageFee to tez instead of gas
// this function calculate the averageFee for an address based over the last 100 txs
export async function getAddressAverageFee(address) {
  const NUMBER_OF_TXS = 100
  const data = await getLastOperations(address, NUMBER_OF_TXS)

  var totalGasUsed = 0
  if (Array.isArray(data)) {
    for (var index in data) {
      totalGasUsed += data[index]?.gas_used;
    }
    const averageFee = totalGasUsed / NUMBER_OF_TXS;
    return averageFee;
  } else {
    // Handle the case where data is not an array (e.g., if there's an issue with the API response)
    console.error("Data is not an array:", data);
    return null; // or another appropriate value
  }
}

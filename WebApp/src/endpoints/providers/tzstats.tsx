import axios from 'axios'

async function fetch(urn: string) {
  try {
    const response = await axios.get('https://api.tzstats.com/' + urn);

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
  const last_block = await getLastBlockHash();
  const data = await fetch(`explorer/block/${last_block}`);
  const time = data?.time;

  if (time) {
    // Parse the original time string as a Date object
    const date = new Date(time);

    // Format the date in the desired format
    const formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`;

    return formattedTime;
  }

  return null; // Handle the case where data?.time is null or undefined
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

export async function get10LastOperations(address) {
  const data = await fetch(`explorer/contract/${address}/calls?prim=1&order=desc&limit=10`)
  return data
}

import axios from 'axios'
import {
  getTransaction, getTransactionStatus, isCollection,
  getCoinData, getTransactionAssets ,getContractData,
  getTransactionFunctionName, getTokenSortedByValue, 
} from './tzkt'

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

export async function getLastOperations(address,number) {
  let data
  if (address.startsWith('KT')) {
  data = await fetch(`explorer/contract/${address}/calls?prim=1&order=desc&limit=${number}`)
  }
  else { 
  data = await fetch(`explorer/account/${address}/operations?prim=1&order=desc&limit=${number}`)
  }
  return data
}
// TODO : convert the averageFee to tez instead of gas
// this function calculate the averageFee for an address based over the last 100 txs
export async function getAverageFeeAddress(address) {
  const NUMBER_OF_TXS = 100
  const data = await getLastOperations(address,NUMBER_OF_TXS)

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


async function discrimateOperationType(receiver, contractData, functionName) {
  return receiver.startsWith('tz') // native xtz transfer
    || contractData.kind === 'asset' && functionName === 'transfer' // fa2 transfer
    ? 'transfer' : 'call'
}

export async function listLastOperations(address, number) {
  const data = await getLastOperations(address, number);
  const listOfOperations = await Promise.all(data.map(async (operation) => {
    let id = operation?.hash;
    var { tzktId, sender, receiver, amount, fee, timestamp } = await getTransaction(id);
    var status = await getTransactionStatus(id);
    var assets = await getTransactionAssets(tzktId);
    var contractData = await getContractData(receiver);
    var functionName = await getTransactionFunctionName(id);
    var operationType = await discrimateOperationType(receiver, contractData, functionName);

    if (operationType === 'transfer') {
      return {
        artifactType: 'transfer',
        operation: {
          id: id,
          status: status,
          date: timestamp,
          from: sender,
          to: receiver,
          transferedAssets: {
            from: sender,
            to: receiver,
            asset: assets,
          },
        } as Transfer,
      };
    } else {
      return {
        artifactType: 'call',
        operation: {
          id: id,
          status: status,
          date: timestamp,
          from: sender,
          to: receiver,
          transferedAssets: assets.map((asset) => ({
            from: sender,
            to: receiver,
            asset: asset,
          })),
          contractName: contractData?.alias,
          functionName,
        },
      } as Call;
    }
  }));

  return listOfOperations;
}



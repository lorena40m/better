import axios from 'axios'
import { Token, Coin, Holder } from '../API'
import { ipfsToHttps } from './utils'

async function fetch(urn: string) {
  try {
    const response = await axios.get('https://api.tzkt.io/' + urn);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch external data. Status code:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return null
}

export async function getTransaction(hash) {
  const data = await fetch(`v1/operations/${hash}`)
  return {
    tzktId: data?.[0]?.id as string | null,
    sender: data?.[0]?.sender?.address as string | null,
    receiver: data?.[1]?.target?.address || data?.[0]?.target?.address as string | null,
    amount: data?.[1]?.amount || data?.[0]?.amount  as string | null,
    fee: (data?.[0]?.bakerFee + data?.[0]?.storageFee + data?.[0]?.allocationFee) as string | null,
    timestamp: data?.[0]?.timestamp as string | null,
  }
}

export async function getTransactionStatus(hash) {
  return (await fetch(`v1/operations/${hash}/status`)) as string | null
}

export async function getTransactionAssets(tzktId) {
  return (await fetch(`v1/tokens/transfers/?transactionId=${tzktId}`))
    ?.map(tokenData => {
      return {
        coin: {
          id: tokenData.token.contract.address,
          logo: ipfsToHttps(tokenData.token.metadata.thumbnailUri),
          name: tokenData.token.metadata.name,
          ticker: tokenData.token.metadata.symbol,
          decimals: tokenData.token.metadata.decimals,
          lastPrice: null, // TO CHECK: don't need
          circulatingSupplyOnChain: tokenData.token.totalSupply,
          holders: null, // TO CHECK: don't need
        },
        quantity: tokenData.amount,
      }
    }) as Token[] | null
}
export async function isCollection(hash) {
  return (await fetch(`v1/tokens/transfers/?token.contract=${hash}`))
    ?.[0]?.token?.metadata?.decimals == 0
}

export async function getTransactionFunctionName(hash) {
  const internalTransactionList = await fetch(`v1/operations/transactions/${hash}`)
  const masterTransaction = internalTransactionList?.[0]
  return (masterTransaction?.parameter?.entrypoint as string) ?? null
}

export async function getCoinData(contractHash, lastPrice) {
  // Note: this fetch could also be used for NFTs!
  const data = await fetch(`v1/tokens/?contract=${contractHash}`)
  const coin = data?.[0]
  return {
    id: contractHash,
    logo: ipfsToHttps(coin?.metadata?.thumbnailUri),
    name: coin?.contract.alias,
    ticker: coin?.metadata?.symbol,
    decimals: Number(coin?.metadata?.decimals),
    lastPrice : lastPrice,
    circulatingSupplyOnChain: coin?.totalSupply,
    holders: coin?.holdersCount.toString(),
  } as Coin
}

export async function getCoinHolders(contractHash) {
  return( await fetch(`v1/tokens/balances?token.contract=${contractHash}`))
  ?.map(holderData => {
      return {
        id : holderData.account.address,
        name : "", // TODO : should we query the name ?
        quantity : holderData.balance,
      }
    }) as Holder[] | null
}

export async function getCoinYearlyTransfersAndVolume(contractHash) {
  const currentDate = new Date()
  const oneYearAgo = new Date(currentDate)
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  // Format the ISO 8601 timestamps for the start and end dates
  const startDateISO = oneYearAgo.toISOString()
  let sum = 0
  let count = 0
  try {
    const response = await fetch(`v1/tokens/transfers?token.contract=${contractHash}&timestamp.gt=${startDateISO}`)

    const transfers = response?.map(transferData => ({
      id : transferData.id,
      balance : transferData.amount
    }))
    const totalAmount = transfers.reduce((sum, transfer) => sum + Number(transfer.balance), 0);
    const count = transfers.length;
    return { sum: totalAmount, count: count };
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getContractData(contractHash) {
  return await fetch(`v1/contracts/${contractHash}`)
}

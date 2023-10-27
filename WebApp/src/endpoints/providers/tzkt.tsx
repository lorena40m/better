import axios from 'axios'
import { Token, Coin } from '../API'

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
    fee: data?.[1]?.bakerFee || data?.[0]?.bakerFee as string | null,
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
          logo: tokenData.token.metadata.thumbnailUri,
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
  return masterTransaction?.parameter?.entrypoint as string | null
}

export async function getCoinData(contractHash, lastPrice) {
  const l = x => { console.log(x); return x }
  const coin = l(await fetch(`v1/tokens/?contract=${contractHash}`))?.[0]
  return {
    id: contractHash,
    logo: "", // TODO: get logo of a coin
    name: coin.contract.alias,
    ticker: '', // TODO
    decimals: 6, // TODO
    lastPrice: lastPrice, // TODO also
    circulatingSupplyOnChain: coin.totalSupply,
    holders: coin.holdersCount,
  } as Coin
}

export async function getTokenSortedByValue(ownerAddress: string, xtzPrice: number) {
  const tokens = await fetch(`v1/tokens/balances/?account.eq=${ownerAddress}`)

  return (await Promise.all(tokens.map(async tokenData => {
    return {
      coin: await getCoinData(
        tokenData.token.contract.address,
        Math.floor(tokenData.balanceValue / tokenData.balance * xtzPrice * 100).toString()
      ),
      quantity: tokenData.balance,
      valueInXtz: tokenData.balanceValue,
    } as Token
  })))
    .sort((a, b) => a.valueInXtz - b.valueInXtz) as Token[]
}

export async function getContractData(contractHash) {
  return (await fetch(`v1/contracts?address=${contractHash}`))?.[0]
}

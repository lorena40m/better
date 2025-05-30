import { eliminateDuplicates, groupBy } from '@/utils/arrays'
import axios from 'axios'

async function fetchApi(url, data = null) {
  try {
    const response = await axios.post(`/api/${url}`, data)
    return response.data
  } catch (err) {
    console.error(`Error on /api/${url}:`, err)
  }
}

import type { Rates } from '@/pages/api/rates'
export async function fetchRates(): Promise<Rates> {
  return await fetchApi('rates')
}

import type { HomeStats } from '@/pages/api/home-stats'
export async function fetchHomeStats(): Promise<HomeStats> {
  return await fetchApi('home-stats')
}

import type { HomeCollections } from '@/pages/api/home-collections'
export async function fetchHomeCollections(): Promise<HomeCollections> {
  return await fetchApi('home-collections')
}

import type { HomeCoins } from '@/pages/api/home-coins'
export async function fetchHomeCoins(): Promise<HomeCoins> {
  return await fetchApi('home-coins')
}

import type { AccountTokens } from '@/pages/api/account-tokens'
export async function fetchAccountTokens(address): Promise<AccountTokens> {
  return await fetchApi(`account-tokens?address=${address}`)
}

import type { Info } from '@/pages/api/accounts-info'
export function fetchAccountInfo(address: string) {
  return fetchApi(`accounts-info`, { addresses: [address] }).then(response => response[0] as Info)
}

import type { Contract } from '@/pages/api/contract-infos'
export async function fetchContractInfos(address: string) {
  const infos = await fetchApi(`contract-infos?address=${address}`).then(response => response.infos as Contract)
  return infos
}

export async function fetchCollectionTokens(id: string, limit: number, offset: number, address: string) {
  const tokens = await fetchApi(`collection-tokens?id=${id}&limit=${limit}&offset=${offset}&address=${address}`).then(
    response => response.tokens,
  )
  return tokens
}

export async function fetchAddressFromDomain(domain: string) {
  const address = await fetchApi(`address-from-domain?domain=${domain}`).then(response => response)
  return address
}

export async function fetchCoinInfos(id: string) {
  const infos = await fetchApi(`coin-infos?id=${id}`).then(response => response)
  return infos
}

export async function fetchCoinGraph(symbol: string) {
  const graphData = await fetchApi(`coin-graph?symbol=${symbol}`).then(response => response)
  return graphData
}

export async function fetchCoinHolders(id: string) {
  const topHolders = await fetchApi(`coin-holders?id=${id}`).then(response => response)
  return topHolders
}

import type { AccountHistoryOutput } from '@/pages/api/account-history'
export function fetchAccountHistory(
  address: string,
  historyLimit: number,
  counterpartyLimit: number,
  nextPageToken: string = '',
) {
  const data$: Promise<AccountHistoryOutput> = fetchApi(
    `account-history?address=${address}&limit=${historyLimit}&nextPageToken=${nextPageToken}`,
  )
  const history$ = data$.then(data => data.history)
  const nextPageToken$ = data$.then(data => data?.nextPageToken)

  const counterpartiesInfo$ = history$.then(history => {
    const addresses = eliminateDuplicates(
      history.flatMap(batch =>
        batch.flatMap(roots => {
          const rootsByCounterparty = Array.from(groupBy(batch, root => root.counterpartyAddress))
          return rootsByCounterparty
            .slice(0, counterpartyLimit)
            .map(([counterpartyAddress, operations]) => counterpartyAddress)
        }),
      ),
    )

    return fetchApi(`accounts-info`, { addresses }).then(response => response as Info[])
  })

  return { history$, nextPageToken$, counterpartiesInfo$ }
}

import type { OperationBatch } from '@/backend/apiTypes'
import next from 'next'
export async function fetchOperation(hash: string) {
  const infos = await fetchApi(`operation-batch-infos?hash=${hash}`).then(response => response as OperationBatch)
  return infos
}

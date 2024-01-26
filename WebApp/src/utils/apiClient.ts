import axios from "axios";
import { DbAccounts, Shorts } from '@/pages/api/account-history-shorts'
import { Account } from '@/pages/api/_apiTypes'
import { eliminateDuplicates } from '@/utils/arrays'
import { getCache, setCache, NAME_CACHE_KEY } from '@/utils/caches'

async function fetchApi(url, data = null) {
  try {
    const response = await axios.post(`/api/${url}`, data);
    return (response.data);
  } catch (err) {
    console.error(`Error on /api/${url}:`, err);
  }
}

export async function fetchAccountTokens(address) {
  const response = await fetchApi(`account-tokens?address=${address}`);
  const domains = [];
  const nfts = [];
  const coins = [];
  const othersTokens = [];
  response.map((token) => {
    if (token.asset?.assetType === 'coin') {
      coins.push(token);
    } else if (token.asset?.assetType === 'nft') {
      nfts.push(token);
    } else if (token.asset?.id === 1262424) {
      domains.push(token);
    } else {
      othersTokens.push(token);
    }
  });

  return({
    domains: domains,
    nfts: nfts,
    coins: coins,
    othersTokens: othersTokens,
  });
};

import { Infos } from '@/pages/api/user-infos'
export function fetchUserInfos(address: string) {
  const cache: Shorts = getCache(NAME_CACHE_KEY) ?? {}

  const infos0$ = fetchApi(`user-infos?address=${address}`).then(response => response.infos as Infos)
    .then(infos => {
      if (address in cache) infos.account.name = cache[address].name
      return infos
    })

  const infos1$ = new Promise<Infos>(resolve => {
    if (!(address in cache)) {
      fetchApi(`tzkt-names`, { addresses: [address] }).then(response => {
        const name = response.names[address] as string

        if (name) infos0$.then(infos => {
          infos.account.name = name

          cache[address] = {
            name: name,
            image: infos.account.image,
          }
          setCache(NAME_CACHE_KEY, cache)

          resolve(infos)
        })
      })
    }
  })

  return { infos0$, infos1$ }
}

import { Contract } from '@/pages/api/contract-infos';
export async function fetchContractInfos(address: string) {
	const infos = await fetchApi(`contract-infos?address=${address}`).then(response => response.infos as Contract);
	return (infos);
}

import { History } from '@/pages/api/account-history'
export function fetchAccountHistory(address: string, limit: number) {
  function updateHistoryWith(history: History, shorts: Shorts): History {
    return history.map(batch =>
      batch.map(operation => ({
        ...operation,
        counterparty: {
          ...operation.counterparty,
          ...shorts[operation.counterparty.address],
        }
      }))
    )
  }

  const cachedShorts: Shorts = getCache(NAME_CACHE_KEY)

  const history0$ = fetchApi(`account-history?address=${address}&limit=${limit}`)
    .then(response => response.history as History)
    .then(history => cachedShorts ? updateHistoryWith(history, cachedShorts) : history)

  const history1$ = history0$.then(async history => {
    const accounts = history.flatMap(batch =>
      batch.slice(0, 4)
        .filter(operation => !operation.counterparty.name)
        .map(operation => operation.counterpartyDbAccount)
    )
    const shorts = await fetchAccountShorts(accounts)
    return updateHistoryWith(history, shorts)
  })

  return { history0$, history1$ };
}

export async function fetchAccountShorts(accounts: DbAccounts): Promise<Shorts> {
  accounts = eliminateDuplicates(accounts, 'Id')
  const cache: Shorts = getCache(NAME_CACHE_KEY) ?? {}
  const nonCached: DbAccounts = accounts.filter(a => !(a.Address in cache))

  if (nonCached.length === 0) return cache

  const shorts = (await fetchApi(`account-history-shorts`, { accounts: nonCached })).shorts as Shorts

  Object.assign(cache, shorts)
  setCache(NAME_CACHE_KEY, cache)

  return cache
}

export async function fetchTzktNames(accounts: Account[]): Promise<Shorts> {
  accounts = eliminateDuplicates(accounts, 'address')
  const cache: Shorts = getCache(NAME_CACHE_KEY) ?? {}
  const nonCached = accounts.filter(a => !(a.address in cache))

  if (nonCached.length === 0) return cache

  const names = (await fetchApi(`tzkt-names`, {
    addresses: nonCached.map(a => a.address)
  })).names as Record<string, string>

  for (const address in names) {
    cache[address] = {
      name: names[address],
      image: accounts.find(a => a.address === address).image,
    }
  }

  setCache(NAME_CACHE_KEY, cache)

  return cache
}

import { OperationBatch } from "@/pages/api/_apiTypes";
export async function fetchOperation(hash: string) {
  const infos = await fetchApi(`operation-batch-infos?hash=${hash}`).then(response => response as OperationBatch);
	return (infos);
}
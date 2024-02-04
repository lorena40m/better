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

import { AccountTokens } from '@/pages/api/account-tokens'
export async function fetchAccountTokens(address): Promise<AccountTokens> {
  return await fetchApi(`account-tokens?address=${address}`);
};

import { Infos } from '@/pages/api/user-infos'
export function fetchUserInfos(address: string) {
  const cache: Shorts = getCache(NAME_CACHE_KEY) ?? {}

  const infos0$ = fetchApi(`user-infos?address=${address}`).then(response => response.infos as Infos)
    .then(infos => {
      if (infos.account.name) {
        cache[address] = {
          name: infos.account.name,
          image: infos.account.image,
        }
        setCache(NAME_CACHE_KEY, cache)
        return infos
      }
      if (address in cache) infos.account.name = cache[address].name
      return infos
    })

  const infos1$ = new Promise<Infos>(resolve => {
    if (!(address in cache)) {
      fetchApi(`tzkt-names`, { addresses: [address] }).then(response => {
        const name = response.names[address] as string

        if (name) infos0$.then(infos => {
          if (infos.account.name) return

          infos.account.name = name

          cache[address] = {
            name,
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

export async function fetchAddressFromDomain(domain: string) {
	const address = await fetchApi(`address-from-domain?domain=${domain}`).then(response => response);
	return (address);
}

import { History } from '@/pages/api/account-history'
export function fetchAccountHistory(address: string, limit: number) {
  const cachedShorts: Shorts = getCache(NAME_CACHE_KEY) ?? {}

  function combineHistoryWithCache(history: History): History {
    const newHistory = history.map(batch =>
      batch.map(operation => {
        const address = operation.counterparty.address

        if (address in cachedShorts) return ({
          ...operation,
          counterparty: {
            ...operation.counterparty,
            ...cachedShorts[address],
          }
        })

        if (operation.counterparty.name) {
          cachedShorts[address] = {
            name: operation.counterparty.name,
            image: operation.counterparty.image,
          }
        }

        return operation
      })
    )

    setCache(NAME_CACHE_KEY, cachedShorts)

    return newHistory
  }

  function combineCacheWithNewShorts(newShorts: Shorts): void {
    // data from newShorts is not prioritary: use it if we don't already have data
    for (const address in newShorts) {
      if (!(address in cachedShorts)) {
        cachedShorts[address] = newShorts[address]
      }
    }
    setCache(NAME_CACHE_KEY, cachedShorts)
  }

  // On récupère des données partielles mais prioritaires : on peut les mettre dans le cache
  const history0$ = fetchApi(`account-history?address=${address}&limit=${limit}`)
    .then(response => response.history as History)
    .then(combineHistoryWithCache)

  const history1$ = history0$.then(async history => {
    const accounts = history.flatMap(batch =>
      batch.slice(0, 4)
        .filter(operation => !operation.counterparty.name)
        .map(operation => operation.counterpartyDbAccount)
    )
    const shorts = (await fetchApi(`account-history-shorts`, {
      accounts: eliminateDuplicates(accounts, 'Id')
    })).shorts as Shorts
    combineCacheWithNewShorts(shorts)
    const newHistory = combineHistoryWithCache(history)

    return newHistory
  })

  return { history0$, history1$ };
}

import { OperationBatch } from "@/pages/api/_apiTypes";
export async function fetchOperation(hash: string) {
  const infos = await fetchApi(`operation-batch-infos?hash=${hash}`).then(response => response as OperationBatch);
	return (infos);
}

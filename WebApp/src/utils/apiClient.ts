import axios from "axios";

async function fetchApi(url) {
  try {
    const response = await axios.get(`/api/${url}`);
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
 const infos$ = fetchApi(`user-infos?address=${address}`).then(response => response.infos as Infos)
 const alias$ = fetchNames([address]).then(aliases => aliases[address])
 return { infos$, alias$ }
}

import { Contract } from '@/pages/api/contract-infos';
export async function fetchContractInfos(address: string) {
	const infos = await fetchApi(`contract-infos?address=${address}`).then(response => response.infos as Contract);
	return (infos);
}

import { History } from '@/pages/api/account-history'
export function fetchAccountHistory(address, limit) {
  const history$ = fetchApi(`account-history?address=${address}&limit=${limit}`)
    .then(response => response.history as History)
  const aliases$ = history$.then(history => {
    const addresses = history.flat(1).map(operation => operation.counterparty.address)
    return fetchNames(addresses)
  })
  return { history$, aliases$ };
}

const NAME_STORAGE_KEY = 'NAMES_v0'

export async function fetchNames(addresses: string[]): Promise<Record<string, string>> {
  const cache = window[NAME_STORAGE_KEY] ?? JSON.parse(localStorage.getItem(NAME_STORAGE_KEY)) ?? {}
  const nonCachedAddresses = addresses.filter(address => !(address in cache))

  if (nonCachedAddresses.length === 0) return cache

  const names = (await fetchApi(`names?addresses=${nonCachedAddresses.join(',')}`)).names

  Object.assign(cache, names)

  window[NAME_STORAGE_KEY] = cache
  localStorage.setItem(NAME_STORAGE_KEY, JSON.stringify(cache))

  return cache
}

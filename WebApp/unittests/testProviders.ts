import { expect, TestCase, TestScript } from './framework'

import { getTop50Cryptos } from '../src/endpoints/providers/coinmarketcap'
import {
  getBlockDate,
  getXtzPrice,
  getWallet,
  getLastOperations,
  getAddressAverageFee,
} from '../src/endpoints/providers/tzstats'
import {
  getTransaction,
  getTransactionStatus,
  getTransactionAssets,
  isCollection,
  getTransactionFunctionName,
  getCoinData,
  getTokenSortedByValue,
  getContractData,
} from '../src/endpoints/providers/tzkt'

const ids: any = {
  contract: 'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u',
  transfer: 'opH7gHRCDgGKZf6T3wCjvAzn9uRWrs2sbdFzUjVsjM14MGKfcwd',
  tezosTransfer: 'opSB6TVg9xAYCXESzqafCBivJwg5ZLHBeEQ94Ln5Xq9oa1SPsuK',
  call: 'onmTvDE13EZ1NAC3GSbxp7yEhXRk7tNaEFDyX4hg1AXvrnwye57',
  coin: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
  collection: 'KT1Q71TpT9Y6UGLx4EnKoLe4duTLzmoePQCA',
  wallet: 'tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX',
}

async function testProviderFunction(provider: string, fc: Function) {
  // `test that ${provider}() provider is ok within a reasonable time`
  const t1 = new Date()
  let res, response
  try {
    res = fc()
  } catch (error) {
    console.log(error)
    expect('test that ${provider}() provider should success', false)
  }
  expect('test that ${provider}() provider return 200', (await res).statusCode === 200)
  const t2 = new Date()
  expect('test that ${provider}() provider return within a reasonable time', (+t2 - +t1) < 300)
}

TestScript(async function () {
  await TestCase('CoinMarketCap provider', async function () {
    await testProviderFunction('getTop50Cryptos', () => getTop50Cryptos(100, 'market_cap'))
  })

  await TestCase('TzStats provider', async function () {
    await testProviderFunction('getBlockDate', getBlockDate)
    await testProviderFunction('getXtzPrice', getXtzPrice)
    await testProviderFunction('getWallet', () => getWallet(ids['wallet']))
    await testProviderFunction('getLastOperations', () => getLastOperations(ids['wallet'], 100))
    await testProviderFunction('getAddressAverageFee', () => getAddressAverageFee(ids['wallet']))
  })

  await TestCase('TzKT provider', async function () {
    await testProviderFunction('getTransaction', () => getTransaction(ids['transfer']))
    await testProviderFunction('getTransactionStatus', () => getTransactionStatus(ids['transfer']))
    await testProviderFunction('getTransactionAssets', () => getTransactionAssets('792209768054784'))
    await testProviderFunction('isCollection', () => isCollection(ids['collection']))
    await testProviderFunction('getTransactionFunctionName', () => getTransactionFunctionName(ids['call']))
    await testProviderFunction('getCoinData', () => getCoinData(ids['coin'], '1'))
    await testProviderFunction('getTokenSortedByValue', () => getTokenSortedByValue(ids['wallet'], 0.65))
    await testProviderFunction('getContractData', () => getContractData(ids['contract']))
  })
})

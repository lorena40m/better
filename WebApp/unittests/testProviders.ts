import { expect, TestCase, TestScript, logResult } from './framework'

import { getTop50Cryptos } from '../src/endpoints/providers/coinmarketcap'
import { getTopNftCollection, getWalletNfts } from '../src/endpoints/providers/objkt'
import { getBlockNumber } from '../src/endpoints/providers/rpc'
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
  getCoinHolders,
  getCoinYearlyTransfersAndVolume,
  getTokenSortedByValue,
  getContractData,
} from '../src/endpoints/providers/tzkt'

import { ids } from './sampleIds'

async function testProviderFunction(provider: string, fc: Function) {
  const t1 = new Date()
  let res = await fc()
  expect(`${provider}() provider return something`, res)
  const t2 = new Date()
  const time = +t2 - +t1
  expect(`${provider}() provider return within a reasonable time: ${time}ms; expect <400ms`, time < 400, 'warning')
  logResult(`${provider}() in ${time}ms`, res)
}

TestScript(async function () {
  await TestCase('CoinMarketCap provider', async function () {
    await testProviderFunction('getTop50Cryptos', () => getTop50Cryptos(100, 'market_cap'))
  })

  await TestCase('ObjKT provider', async function () {
    await testProviderFunction('getTopNftCollection', () => getTopNftCollection(100, 'trending'))
    await testProviderFunction('getWalletNfts', () => getWalletNfts(ids.wallet))
  })

  await TestCase('RPC provider', async function () {
    await testProviderFunction('getBlockNumber', () => getBlockNumber())
  })

  await TestCase('TzKT provider', async function () {
    await testProviderFunction('getTransaction', () => getTransaction(ids.transfer))
    await testProviderFunction('getTransactionStatus', () => getTransactionStatus(ids.transfer))
    await testProviderFunction('getTransactionAssets', () => getTransactionAssets('792209768054784'))
    await testProviderFunction('isCollection', () => isCollection(ids.collection))
    await testProviderFunction('getTransactionFunctionName', () => getTransactionFunctionName(ids.call))
    await testProviderFunction('getCoinData', () => getCoinData(ids.coin, '1'))
    await testProviderFunction('getCoinHolders', () => getCoinHolders(ids.coin))
    await testProviderFunction('getCoinYearlyTransfersAndVolume', () => getCoinYearlyTransfersAndVolume(ids.coin))
    await testProviderFunction('getTokenSortedByValue', () => getTokenSortedByValue(ids.wallet, 0.65))
    await testProviderFunction('getContractData', () => getContractData(ids.contract))
  })

  await TestCase('TzStats provider', async function () {
    await testProviderFunction('getBlockDate', () => getBlockDate())
    await testProviderFunction('getXtzPrice', () => getXtzPrice())
    await testProviderFunction('getWallet', () => getWallet(ids.wallet))
    await testProviderFunction('getLastOperations', () => getLastOperations(ids.wallet, 100))
    await testProviderFunction('getAddressAverageFee', () => getAddressAverageFee(ids.wallet))
  })
})

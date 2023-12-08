import { expect, TestCase, TestScript, logResult } from './framework'
import * as coinmarketcap from '../src/endpoints/providers/coinmarketcap'
import * as objkt from '../src/endpoints/providers/objkt'
import * as rpc from '../src/endpoints/providers/rpc'
import * as tzstats from '../src/endpoints/providers/tzstats'
import * as tzkt from '../src/endpoints/providers/tzkt'
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
    await testProviderFunction('getTop50Cryptos', () => coinmarketcap.getTop50Cryptos(100, 'market_cap'))
  })

  await TestCase('ObjKT provider', async function () {
    await testProviderFunction('getTopNftCollection', () => objkt.getTopNftCollection(100, 'trending'))
    await testProviderFunction('getWalletNfts', () => objkt.getWalletNfts(ids.wallet1, 0.9))
  })

  await TestCase('RPC provider', async function () {
    await testProviderFunction('getBlockNumber', () => rpc.getBlockNumber())
  })

  await TestCase('TzKT provider', async function () {
    await testProviderFunction('getOperationGroup', () => tzkt.getOperationGroup(ids.transfer))
    await testProviderFunction('getTransactionStatus', () => tzkt.getTransactionStatus(ids.transfer))
    await testProviderFunction('getTransactionAssets', () => tzkt.getTransactionAssets('792209768054784'))
    await testProviderFunction('isCollection', () => tzkt.isCollection(ids.collection))
    await testProviderFunction('getTransactionFunctionName', () => tzkt.getTransactionFunctionName(ids.call))
    await testProviderFunction('getCoin', () => tzkt.getCoin(ids.coin, 0, '1'))
    await testProviderFunction('getCoinHolders', () => tzkt.getCoinHolders(ids.coin))
    await testProviderFunction('getCoinYearlyTransfersAndVolume', () => tzkt.getCoinYearlyTransfersAndVolume(ids.coin))
    await testProviderFunction('getContractData', () => tzkt.getContractData(ids.contract))
  })

  await TestCase('TzStats provider', async function () {
    await testProviderFunction('getBlockDate', () => tzstats.getBlockDate())
    await testProviderFunction('getXtzPrice', () => tzstats.getXtzPrice())
    await testProviderFunction('getWallet', () => tzstats.getWallet(ids.wallet1))
    await testProviderFunction('getLastOperations', () => tzstats.getLastOperations(ids.wallet1, 100))
    await testProviderFunction('getAddressAverageFee', () => tzstats.getAddressAverageFee(ids.wallet1))
    await testProviderFunction('getTokenSortedByValue', () => tzstats.getTokenSortedByValue(ids.wallet1))
  })
})

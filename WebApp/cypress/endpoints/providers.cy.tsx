import {
  getBlockDate,
  getXtzPrice,
  getWallet,
  getLastOperations,
  getAddressAverageFee,
} from '../../src/endpoints/providers/tzstats'
import {
  getTransaction,
  getTransactionStatus,
  getTransactionAssets,
  isCollection,
  getTransactionFunctionName,
  getCoinData,
  getTokenSortedByValue,
  getContractData,
} from '../../src/endpoints/providers/tzkt'

const ids: any = {
  contract: 'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u',
  transfer: 'opH7gHRCDgGKZf6T3wCjvAzn9uRWrs2sbdFzUjVsjM14MGKfcwd',
  tezosTransfer: 'opSB6TVg9xAYCXESzqafCBivJwg5ZLHBeEQ94Ln5Xq9oa1SPsuK',
  call: 'onmTvDE13EZ1NAC3GSbxp7yEhXRk7tNaEFDyX4hg1AXvrnwye57',
  coin: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
  collection: 'KT1Q71TpT9Y6UGLx4EnKoLe4duTLzmoePQCA',
  wallet: 'tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX',
}

// Call the provider
function testProviderFunction(provider: string, fc: Function) {
  it(`test that ${provider}() provider is ok within a reasonable time`, async () => {
    const t1 = new Date()
    let res, response
    cy.intercept('').as('requests')
    try {
      res = fc()
    } catch (error) {
      console.log(error)
      expect(error).to.not.be.ok
    }
    cy.wait('@requests').its('response.statusCode').should('eq', 200)
    expect(await res).to.be.ok
    const t2 = new Date()
    expect(+t2 - +t1).to.be.lessThan(300)
  })
}

describe('tzstats providers', () => {
  testProviderFunction('getBlockDate', getBlockDate)
  testProviderFunction('getXtzPrice', getXtzPrice)
  testProviderFunction('getWallet', () => getWallet(ids['wallet']))
  testProviderFunction('getLastOperations', () => getLastOperations(ids['wallet'], 100))
  testProviderFunction('getAddressAverageFee', () => getAddressAverageFee(ids['wallet']))
})

describe('tzkt providers', () => {
  testProviderFunction('getTransaction', () => getTransaction(ids['transfer']))
  testProviderFunction('getTransactionStatus', () => getTransactionStatus(ids['transfer']))
  testProviderFunction('getTransactionAssets', () => getTransactionAssets('792209768054784'))
  testProviderFunction('isCollection', () => isCollection(ids['collection']))
  testProviderFunction('getTransactionFunctionName', () => getTransactionFunctionName(ids['call']))
  testProviderFunction('getCoinData', () => getCoinData(ids['coin'], '1'))
  testProviderFunction('getTokenSortedByValue', () => getTokenSortedByValue(ids['wallet'], 0.65))
  testProviderFunction('getContractData', () => getContractData(ids['contract']))
})

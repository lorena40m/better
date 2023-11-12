import { expect, TestCase, TestScript, logResult } from './framework'

import HomeEndpoint from '../src/endpoints/HomeEndpoint'
import MiscellaneousEndpoint from '../src/endpoints/MiscellaneousEndpoint'
import ArtifactEndpoint from '../src/endpoints/ArtifactEndpoint'
import {
  TransferResponse, CallResponse,
  CoinResponse, CollectionResponse, ContractResponse, WalletResponse,
} from '../src/endpoints/API'
import {
  homeResponseSchema, miscellaneousResponseSchema,
  transferResponseSchema, callResponseSchema,
  coinResponseSchema, collectionResponseSchema, contractResponseSchema, walletResponseSchema,
} from './validationSchemas'
import { InferType } from 'yup'

import { ids } from './sampleIds'

const TEST_CASES = [
  {
    testCaseName: 'HomeEndpoint endpoint',
    endpoint: HomeEndpoint,
    artifactType: null,
    params: {pageSize: 100},
    schema: homeResponseSchema,
  },
  {
    testCaseName: 'MiscellaneousEndpoint endpoint',
    endpoint: MiscellaneousEndpoint,
    artifactType: null,
    params: {pageSize: 100},
    schema: miscellaneousResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: coin artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'coin',
    params: {id: ids.coin, pageSize: 100},
    schema: coinResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: collection artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'collection',
    params: {id: ids.collection, pageSize: 100},
    schema: collectionResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: wallet artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'wallet',
    params: {id: ids.wallet, pageSize: 100},
    schema: walletResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: contract artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'contract',
    params: {id: ids.contract, pageSize: 100},
    schema: contractResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: transfer artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'transfer',
    params: {id: ids.transfer, pageSize: 100},
    schema: transferResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: transfer artifact #2 Tezos Transfer',
    endpoint: ArtifactEndpoint,
    artifactType: 'transfer',
    params: {id: ids.tezosTransfer, pageSize: 100},
    schema: transferResponseSchema,
  },
  {
    testCaseName: 'ArtifactEndpoint endpoint: call artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'call',
    params: {id: ids.call, pageSize: 100},
    schema: callResponseSchema,
  },
]

TestScript(async function () {
  for (const CASE of TEST_CASES) {
    const { testCaseName, endpoint, artifactType, params, schema } = CASE

    await TestCase(testCaseName, async function () {
      // Call the endpoint
      const t1 = new Date()
      const res = await endpoint(params as any)
      // Check that the response is serializable
      const response = JSON.parse(JSON.stringify(res))
      expect(`should return something serializable`, response)
      const t2 = new Date()
      const time = +t2 - +t1
      logResult('${testCaseName} in ${time}ms', response)

      // Wait for a second
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (artifactType) {
        expect(`return the correct ${artifactType} artifactType, got: ${response.artifactType}`, response.artifactType === artifactType)
      }
      expect(`return within a reasonable time: ${time}ms; expect <1000ms`, time < 1000, 'warning')

      // Check for schema validation
      try {
        await schema(params as any).validate(response, { strict: true, abortEarly: false })
        expect(`response is validated by schema`, true)
      } catch (validationError: any) {
        console.error(validationError.toString())
        for (const error of validationError.errors) {
          console.error(error.toString())
        }
        expect(`${validationError} -> see error file for detail`, false)
      }
    })
  }
})


// TODO

// e2e testing with mocked data
// frontend holds with random null data
// frontend holds when backend loose the Internet

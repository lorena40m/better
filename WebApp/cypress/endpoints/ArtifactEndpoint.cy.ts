import ArtifactEndpoint from '../../src/endpoints/ArtifactEndpoint'
import {
  transferResponseSchema, callResponseSchema,
  coinResponseSchema, collectionResponseSchema, contractResponseSchema, walletResponseSchema,
} from './validationSchemas'
import {
  TransferResponse, CallResponse,
  CoinResponse, CollectionResponse, ContractResponse, WalletResponse,
} from '../../src/endpoints/API'
import { InferType } from 'yup'

const ids: any = {
  coin: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
  collection: 'KT1Q71TpT9Y6UGLx4EnKoLe4duTLzmoePQCA',
  wallet: 'tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX',
  contract: 'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u',
  transfer: 'opH7gHRCDgGKZf6T3wCjvAzn9uRWrs2sbdFzUjVsjM14MGKfcwd',
  tezosTransfer: 'opSB6TVg9xAYCXESzqafCBivJwg5ZLHBeEQ94Ln5Xq9oa1SPsuK',
  call: 'onmTvDE13EZ1NAC3GSbxp7yEhXRk7tNaEFDyX4hg1AXvrnwye57',
}

describe('ArtifactEndpoint', () => {
  let artifactData: any = {}

  // Call the endpoint
  before(async() => {
    for (const artifactType in ids) {
      const t1 = new Date()
      const params = {id: ids[artifactType], pageSize: 100}
      console.log(artifactType)

      let res, response
      try {
        res = await ArtifactEndpoint(params)
        // Check that the response is serializable
        response = JSON.parse(JSON.stringify(res))
      } catch (error) {
        console.log(error)
        expect(error).to.not.be.ok
      }

      const t2 = new Date()
      console.log(response) // log it to the console

      artifactData[artifactType] = { t1, t2, params, response }

      // Wait for a second
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  })

  for (const artifactType in ids) {
    console.log('artifactType', artifactType)

    // Assert for response time
    it(`with a ${artifactType} id, should return within a reasonable time`, async () => {
      expect(artifactData[artifactType].t2 - artifactData[artifactType].t1).to.be.lessThan(200)
    })

    // Assert for correct artifactType
    it(`with a ${artifactType} id, should return the correct ${artifactType} artifactType`, async () => {
      expect(artifactData[artifactType].response.artifactType).to.be.equals(artifactType)
    })

    // Assert for response validation
    it(`with a ${artifactType} id, should return the ${artifactType} object`, async () => {
      const schema = ({
        'transfer': transferResponseSchema,
        call: callResponseSchema,
        coin: coinResponseSchema,
        collection: collectionResponseSchema,
        contract: contractResponseSchema,
        wallet: walletResponseSchema,
      } as any)[artifactType](artifactData[artifactType].params)
      try {
        await schema.validate(artifactData[artifactType].response, { strict: true, abortEarly: false })
        expect('no exception means that response is valid').to.be.ok
      } catch (validationError) {
        console.error(validationError)
        for (const error of validationError.errors) {
          console.error(error)
        }
        expect(validationError).to.not.be.ok
      }
    })
  }
})

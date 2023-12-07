import { expect, TestCase, TestScript, logResult } from './framework'
import HomeEndpoint from '../src/endpoints/HomeEndpoint'
import MiscellaneousEndpoint from '../src/endpoints/MiscellaneousEndpoint'
import ArtifactEndpoint from '../src/endpoints/ArtifactEndpoint'
import * as schemas from './validationSchemas'
import { ids } from './sampleIds'

// Multi-assets: KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ
// Tezos Domain: tz1QiNtZx3b6EeATAJ5PgHp2X6y7jwZNXp3G
// Baking Adress: tz3gtoUxdudfBRcNY7iVdKPHCYYX6xdPpoRS
// kUSD logo is not here in wallet : tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX

const TEST_CASES = [
  {
    testCaseName: 'ArtifactEndpoint endpoint: contract artifact',
    endpoint: ArtifactEndpoint,
    artifactType: 'contract',
    params: {id: 'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u', pageSize: 10},
    schema: schemas.contractResponseSchema,
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
      logResult(`${testCaseName} in ${time}ms`, response)

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
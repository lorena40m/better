import MiscellaneousEndpoint from '../../src/endpoints/MiscellaneousEndpoint'
import { miscellaneousResponseSchema } from './validationSchemas'
import { MiscellaneousResponse } from '../../src/endpoints/API'
import { InferType } from 'yup'

describe('MiscellaneousEndpoint', () => {
  let t1, t2, response: MiscellaneousResponse

  // Call the endpoint
  before(async() => {
    t1 = new Date()

    const res = await MiscellaneousEndpoint()
    // Check that the response is serializable
    response = JSON.parse(JSON.stringify(res))

    t2 = new Date()
    console.log(response) // log it to the console
  })

  // Assert for response time
  it('should return within a reasonable time', async () => {
    expect(t2 - t1).to.be.lessThan(100)
  })

  // Assert for response validation
  it('should return the expected object', async () => {
    const schema = miscellaneousResponseSchema()
    try {
      await schema.validate(response, { strict: true, abortEarly: false })
      expect('no exception means that response is valid').to.be.ok
    } catch (validationError) {
      console.error(validationError)
      for (const error of validationError.errors) {
        console.error(error)
      }
      expect(validationError).to.not.be.ok
    }

    // Let Typescript check is the yup schema is compatible with the Typescript type
    // If CheckedResponse is never, it means that compatibility is broken!
    type InferedType = InferType<typeof schema>
    type CheckedResponse = InferedType extends MiscellaneousResponse ? MiscellaneousResponse : never
    const ret: CheckedResponse = response
  })
})

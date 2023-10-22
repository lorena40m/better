import HomeEndpoint from '../../src/endpoints/HomeEndpoint'
import { homeResponseSchema } from './validationSchemas'
import { HomeResponse } from '../../src/endpoints/API'
import { InferType } from 'yup'

describe('HomeEndpoint', () => {
  let t1, t2, params = {pageSize: 100}, response: HomeResponse

  // Call the endpoint
  before(async() => {
    t1 = new Date()

    const res = await HomeEndpoint(params)
    // Check that the response is serializable
    response = JSON.parse(JSON.stringify(res))

    t2 = new Date()
    console.log(res, response) // log it to the console
  })

  // Assert for response time
  it('should return within a reasonable time', async () => {
    expect(t2 - t1).to.be.lessThan(200)
  })

  // Assert for response validation
  it('should return the expected object', async () => {
    const schema = homeResponseSchema(params)
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
    // If CheckedHomeResponse is never, it means that compatibility is broken!
    type InferedType = InferType<typeof schema>
    type CheckedResponse = InferedType extends HomeResponse ? HomeResponse : never
    const ret: CheckedResponse = response
  })
})

// TODO

// e2e testing with mocked data
// test that frontend holds with random null data
// test that frontend holds when backend loose the Internet

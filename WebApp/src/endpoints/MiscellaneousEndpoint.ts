import { MiscellaneousEndpoint } from './API'
import * as tzstats from './providers/tzstats'

export default (async ({}) => {
  return {
    rates: {
      'EUR/USD': '095', // TODO
    },
    xtzPrice: await tzstats.getXtzPrice(),
  }
}) as MiscellaneousEndpoint

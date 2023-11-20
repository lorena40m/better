import { MiscellaneousEndpoint } from './API'
import * as tzstats from './providers/tzstats'

export default (async ({}) => {
  return {
    rates: {
      'EUR/USD': 0.95, // TODO
    },
    xtzPrice: await tzstats.getXtzPrice(),
  }
}) as MiscellaneousEndpoint

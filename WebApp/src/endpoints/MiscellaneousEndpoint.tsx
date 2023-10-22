import { getXtzPrice } from './providers/tzstats'
import { MiscellaneousEndpoint } from './API'

export default (async ({}) => {
  return {
    rates: {
      'EUR/USD': '095', // TODO
    },
    xtzPrice: await getXtzPrice(),
  }
}) as MiscellaneousEndpoint

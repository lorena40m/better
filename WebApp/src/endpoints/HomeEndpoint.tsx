import { HomeResponse, HomeEndpoint } from './API'
import { getXtzPrice, getBlockDate } from './providers/tzstats'
import { getBlockNumber } from './providers/rpc'
import { getTopNftCollection } from './providers/objkt'
import {} from './providers/coinmarketcap'

export default (async ({ pageSize }) => {
  return {
    stats : {
      ethPrice: await getXtzPrice(),
      normalFee: '000', // 0.0015 XTZ
      lastBlockNumber: (await getBlockNumber())?.toString() ?? null,
      lastBlockDate: await getBlockDate(),
    },
    collections: {
      trending: await getTopNftCollection(pageSize, 'trending'), // paginated
      top: await getTopNftCollection(pageSize, 'top'), // paginated
    },
    // TODO: should fetch **tokens on the blockchain**, not coins
    coins: {
      byCap: [],// await getTop50Cryptos('market_cap'), // paginated
      byVolume: [],// await getTop50Cryptos('volume_24h'), // paginated
    },
  }
}) as HomeEndpoint

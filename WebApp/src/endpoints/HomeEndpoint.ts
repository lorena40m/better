import { HomeEndpoint } from './API'
import * as tzstats from './providers/tzstats'
import * as rpc from './providers/rpc'
import * as objkt from './providers/objkt'
import * as coinmarketcap from './providers/coinmarketcap'

export default (async ({ pageSize }) => {
  return {
    stats : {
      normalFee: '001500', // 0.0015 XTZ // await tzstatsgetXtzPrice(),
      lastBlockNumber: (await rpc.getBlockNumber())?.toString() ?? null,
      lastBlockDate: await tzstats.getBlockDate(),
    },
    collections: {
      trending: await objkt.getTopNftCollection(pageSize, 'trending'), // paginated
      top: await objkt.getTopNftCollection(pageSize, 'top'), // paginated
    },
    // TODO: should fetch **tokens on the blockchain**, not coins
    coins: {
      byCap: [],// await coinmarketcap.getTop50Cryptos('market_cap'), // paginated
      byVolume: [],// await coinmarketcap.getTop50Cryptos('volume_24h'), // paginated
    },
  }
}) as HomeEndpoint

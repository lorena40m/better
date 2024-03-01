import { topTokens } from '@/backend/home-tokens'

async function backend() {
  return {
    byCap: topTokens.map(token => ({
      contractId: token["contract address__1"],
      id: token["contract address__1"] + (token["token id"] ? '_' + token["token id"] : ''),
      name: token["Full name"] || token["Alias"],
      ticker: token["ModalCell_joinRow__sUQiU"],
      decimals: token["decimals"], // NB: decimals from the scrapping are not reliable
      logo: [token["token-logo_image__g2g-4 src"]],
      lastPrice: token["Price"],
      circulatingSupplyOnChain: BigInt(Math.round(token["total supply"])).toString(),
      holders: BigInt(Math.round(token["holdersCount"])).toString(),
      capitalizationOnChain: token.mcap,
    })).sort((a, b) => +b.holders - +a.holders),
    byVolume: [],
  }
}

export default async function handler(req, res) {
  res.status(200).json(await backend())
}

export type HomeCoins = Awaited<ReturnType<typeof backend>>

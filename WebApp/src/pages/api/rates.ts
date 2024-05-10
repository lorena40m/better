import * as tzstats from '@/backend/providers/tzstats'

async function backend() {
  const { xtzPrice, usdToEur } = await tzstats.getPrices()

  return {
    fiats: {
      EUR: usdToEur,
    },
    cryptos: {
      XTZ: xtzPrice,
    },
  }
}

export default async function handler(req, res) {
  res.status(200).json(await backend())
}

export type Rates = Awaited<ReturnType<typeof backend>>

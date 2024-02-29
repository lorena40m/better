import * as tzstats from '@/endpoints/providers/tzstats'

export default async function rates(req, res) {
  const { xtzPrice, usdToEur } = await tzstats.getPrices()

  const result = {
    fiats: {
      'EUR': usdToEur,
    },
    cryptos: {
      'XTZ': xtzPrice,
    },
  }

  res.status(200).json(result)

  return result
}

export type Rates = Awaited<ReturnType<typeof rates>>

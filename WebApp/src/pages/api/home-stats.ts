import * as tzstats from '@/backend/providers/tzstats'

async function backend() {
  return {
    normalFee: '007000',
    lastBlockDate: (await tzstats.getLastBlock()).date,
  }
}

export default async function handler(req, res) {
  res.status(200).json(await backend())
}

export type HomeStats = Awaited<ReturnType<typeof backend>>

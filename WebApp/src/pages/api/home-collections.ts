import * as objkt from '@/backend/providers/objkt'

async function backend() {
  return await objkt.getTopNftCollection(20)
}

export default async function handler(req, res) {
  res.status(200).json(await backend())
}

export type HomeCollections = Awaited<ReturnType<typeof backend>>

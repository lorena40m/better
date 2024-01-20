import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/endpoints/providers/db'
import * as tzkt from '@/endpoints/providers/tzkt'

const REQUEST_LIMIT = 40

/*
 * Get aliases from the TzKT API for a set of addresses.
 * Note: alias will be null if there is none for the address
 * Note: alias will not be included if there is a communication error with TzKT (limit reached)
 *   -> retry later
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const addresses = req.body.addresses

  if (addresses.length > REQUEST_LIMIT)
    return res.status(500).json({ error: `Exceeded the limit of ${REQUEST_LIMIT} addresses.` })

  try {
    const aliases = await Promise.all(addresses.map(tzkt.getAlias))

    res.status(200).json({
      names: addresses.reduce((acc, key, index) => {
        acc[key] = aliases[index]
        return acc
      }, {})
    })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

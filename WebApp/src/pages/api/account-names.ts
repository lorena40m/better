import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/endpoints/providers/db'
import * as tzkt from '@/endpoints/providers/tzkt'

/*
 * Get aliases from the TzKT API for a set of addresses.
 * Note: addresses that don't have an alias will not be included in the returned object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const addresses = (<string> req.query.addresses).split(',')

  try {
    const aliases = await Promise.all(addresses.map(tzkt.getAlias))
    res.status(200).json({
      aliases: addresses.reduce((acc, key, index) => {
        acc[key] = aliases[index]
        return acc
      }, {})
    })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

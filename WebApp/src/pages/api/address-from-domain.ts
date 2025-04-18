import { query } from '@/backend/providers/db'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const domain = req.query.domain

  try {
    const address = await query(
      'ADDRESS FROM DOMAIN',
      `
      SELECT
        "Domains"."Address"
      FROM "Domains"
      WHERE "Domains"."Name" ILIKE $1
    `,
      [domain],
    )
    res.status(200).json(address[0].Address)
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

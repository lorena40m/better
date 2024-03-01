import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/backend/providers/db'
import { solveAccountType, solveAddressName, solveAddressImage } from '@/backend/solve'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const domain = req.query.domain;

  try {
    const address = await query('ADDRESS FROM DOMAIN', `
      SELECT
        "Domains"."Address"
      FROM "Domains"
      WHERE "Domains"."Name" = $1
    `, [domain], 'long');
    res.status(200).json(
		address[0].Address
	);
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

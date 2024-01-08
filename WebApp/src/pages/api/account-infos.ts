import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    const user = await query('ACCOUNT INFOS', 'SELECT "Balance", "Id", "TransactionsCount" FROM "Accounts" WHERE "Address" = $1', [address]);
    res.status(200).json(user[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}